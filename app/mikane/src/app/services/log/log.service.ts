import { inject, Injectable } from '@angular/core';
import { LOG_LEVEL, LoggerLevel } from './log-level.config';

type LogTypes = Error | string;

@Injectable({
	providedIn: 'root',
})
export class LogService {
	private logLevel = inject(LOG_LEVEL);

	private sendLog(_level: string, _message: LogTypes): void {
		// Placeholder for sending logs to backend
	}

	error(message: LogTypes): void {
		if (this.logLevel <= LoggerLevel.ERROR) {
			console.error(message);
			this.sendLog('ERROR', message);
		}
	}

	warn(message: string): void {
		if (this.logLevel <= LoggerLevel.WARN) {
			console.warn(message);
			this.sendLog('WARN', message);
		}
	}

	info(message: string): void {
		if (this.logLevel <= LoggerLevel.INFO) {
			// eslint-disable-next-line no-console
			console.info(message);
			this.sendLog('INFO', message);
		}
	}

	debug(message: string): void {
		if (this.logLevel <= LoggerLevel.DEBUG) {
			// eslint-disable-next-line no-console
			console.debug(message);
			this.sendLog('DEBUG', message);
		}
	}

	trace(message: string): void {
		if (this.logLevel <= LoggerLevel.TRACE) {
			// eslint-disable-next-line no-console
			console.trace(message);
			this.sendLog('TRACE', message);
		}
	}
}
