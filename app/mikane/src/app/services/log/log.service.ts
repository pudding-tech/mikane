import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { filter, Subscription, take } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { AuthService } from '../auth/auth.service';
import { LOG_LEVEL, LoggerLevel } from './log-level.config';

type LogTypes = Error | string;
interface LogPayload {
	message: LogTypes;
	level: 'alert' | 'error' | 'warn' | 'info' | 'fail' | 'success' | 'log' | 'debug' | 'verbose';
	timestamp: Date;
}

@Injectable({
	providedIn: 'root',
})
export class LogService implements OnDestroy {
	private httpClient = inject(HttpClient);
	private logLevel = inject(LOG_LEVEL);
	private authService = inject(AuthService);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl;
	private logStash: LogPayload[] = [];
	private logStashSubscription: Subscription;
	private httpSubscription: Subscription;

	private sendLog(log: LogPayload): void {
		if (this.authService?.authenticated) {
			this.httpSubscription = this.httpClient.post<LogPayload>(`${this.apiUrl}log`, log).subscribe();
		} else {
			if (!this.logStashSubscription) {
				this.setupStashPopper();
			}
			this.logStash.push(log);
		}
	}

	private setupStashPopper(): void {
		this.logStashSubscription = this.authService?.authenticated$
			.pipe(
				filter((status) => status === true),
				take(1),
			)
			.subscribe({
				next: () => {
					while (this.logStash?.length > 0) {
						this.sendLog(this.logStash.pop());
					}
				},
			});
	}

	private toPayload(level: LogPayload['level'], message: LogTypes): LogPayload {
		return {
			message,
			level,
			timestamp: new Date(),
		};
	}

	error(message: LogTypes): void {
		if (this.logLevel <= LoggerLevel.ERROR) {
			console.error(message);
			if ((message as Error)['message']) {
				message = (message as Error)['message'];
			}
			this.sendLog(this.toPayload('error', message));
		}
	}

	warn(message: string): void {
		if (this.logLevel <= LoggerLevel.WARN) {
			console.warn(message);
			this.sendLog(this.toPayload('warn', message));
		}
	}

	info(message: string): void {
		if (this.logLevel <= LoggerLevel.INFO) {
			// eslint-disable-next-line no-console
			console.info(message);
			this.sendLog(this.toPayload('info', message));
		}
	}

	debug(message: string): void {
		if (this.logLevel <= LoggerLevel.DEBUG) {
			// eslint-disable-next-line no-console
			console.debug(message);
			this.sendLog(this.toPayload('debug', message));
		}
	}

	trace(message: string): void {
		if (this.logLevel <= LoggerLevel.TRACE) {
			// eslint-disable-next-line no-console
			console.trace(message);
			this.sendLog(this.toPayload('verbose', message));
		}
	}

	ngOnDestroy(): void {
		this.logStashSubscription?.unsubscribe();
		this.httpSubscription?.unsubscribe();
	}
}
