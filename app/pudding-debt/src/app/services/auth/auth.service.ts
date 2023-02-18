import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
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

	resetPassword(password: string): Observable<User> {
		return this.httpClient
			.post<User>(this.apiUrl + 'reset-password', {
				userId: this.currentUser.id,
				password: password,
			})
			.pipe(tap((user) => (this.currentUser = user)));
	}
}
