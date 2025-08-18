import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { User } from '../user/user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private httpClient = inject(HttpClient);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl;
	private currentUser: User;

	private _redirectUrl: string;

	public authenticated$ = new BehaviorSubject<boolean | null>(false);

	get authenticated(): boolean {
		return !!this.currentUser;
	}

	get redirectUrl(): string {
		// Consume redirect URL
		const redirectUrl = `${this._redirectUrl}`;
		delete this._redirectUrl;
		return redirectUrl;
	}

	set redirectUrl(value: string) {
		this._redirectUrl = value;
	}

	login(username: string, password: string): Observable<User> {
		return this.httpClient
			.post<User>(this.apiUrl + 'login', {
				usernameEmail: username,
				password: password,
			})
			.pipe(
				tap((user) => {
					this.currentUser = user;
					this.authenticated$.next(true);
				}),
			);
	}

	logout() {
		return this.httpClient.post<void>(this.apiUrl + 'logout', {}).pipe(
			tap(() => {
				this.clearCurrentUser();
				this.authenticated$.next(false);
			}),
		);
	}

	sendResetPasswordEmail(email: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + 'requestpasswordreset', { email });
	}

	getCurrentUser(): Observable<User> {
		if (this.currentUser) {
			this.authenticated$.next(true);
			return of(this.currentUser);
		} else {
			return this.httpClient.get<User>(this.apiUrl + 'login').pipe(
				tap((user) => {
					this.currentUser = user;
					this.authenticated$.next(true);
				}),
			);
		}
	}

	resetPassword(key: string, password: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + 'resetpassword', { key, password });
	}

	clearCurrentUser() {
		delete this.currentUser;
	}
}
