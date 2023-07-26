import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { User } from '../user/user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = this.env.apiUrl;
	private currentUser: User;

	private _redirectUrl: string;

	get redirectUrl(): string {
		// Consume redirect URL
		const redirectUrl = `${this._redirectUrl}`;
		delete this._redirectUrl;
		return redirectUrl;
	}

	set redirectUrl(value: string) {
		this._redirectUrl = value;
	}

	constructor(private httpClient: HttpClient, @Inject(ENV) private env: Environment) {}

	login(username: string, password: string): Observable<User> {
		return this.httpClient
			.post<User>(this.apiUrl + 'login', {
				usernameEmail: username,
				password: password,
			})
			.pipe(tap((user) => (this.currentUser = user)));
	}

	logout() {
		return this.httpClient.post<void>(this.apiUrl + 'logout', {}).pipe(
			tap(() => {
				this.clearCurrentUser();
			})
		);
	}

	sendResetPasswordEmail(email: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + 'requestpasswordreset', { email });
	}

	getCurrentUser(): Observable<User> {
		if (this.currentUser) {
			return of(this.currentUser);
		} else {
			return this.httpClient.get<User>(this.apiUrl + 'login').pipe(tap((user) => (this.currentUser = user)));
		}
	}

	resetPassword(key: string, password: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + 'resetpassword', { key, password });
	}

	clearCurrentUser() {
		delete this.currentUser;
	}
}
