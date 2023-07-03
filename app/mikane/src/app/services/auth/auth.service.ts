import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../user/user.service';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = environment.apiUrl;
	private currentUser: User;

	constructor(private httpClient: HttpClient) {}

	login(username: string, password: string): Observable<User> {
		return this.httpClient
			.post<User>(this.apiUrl + 'login', {
				usernameEmail: username,
				password: password,
			})
			.pipe(tap((user) => (this.currentUser = user)));
	}

	logout() {
		return this.httpClient.post(this.apiUrl + 'logout', {});
	}

	sendResetPasswordEmail(email: string): Observable<Object> {
		return this.httpClient.post(this.apiUrl + 'requestpasswordreset', { email });
	}

	getCurrentUser(): Observable<User> {
		if (this.currentUser) {
			return of(this.currentUser);
		} else {
			return this.httpClient.get<User>(this.apiUrl + 'login').pipe(tap((user) => (this.currentUser = user)));
		}
	}

	verifyPasswordReset(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + 'verifypasswordreset/' + key);
	}

	resetPassword(key: string, password: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + 'resetpassword', { key, password });
	}
}