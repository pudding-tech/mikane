import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Phonenumber } from 'src/app/types/phonenumber.type';
import { environment } from 'src/environments/environment';
import { Expense } from '../expense/expense.service';

export interface User {
	id: string;
	name: string;
	username: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	created?: Date;
	avatarURL?: string;
	eventInfo?: {
		id: string;
		isAdmin: boolean;
		joinedTime: Date;
	};
	authenticated: boolean;
}

/**
 * {
 *   "user": {
 *     "id": "24b96dad-e95a-4794-9dea-25fd2bbd21a1",
 *     "username": "testuser",
 *     "name": "Test",
 *     "email": "test@user.com",
 *     "created": "2023-01-20T18:00:00",
 *     "avatarURL": "https://gravatar.com/avatar/aaaa",
 *     "eventInfo": {
 *       "id": "24b96dad-e95a-4794-9dea-25fd2bbd21a1",
 *       "isAdmin": false,
 *       "joinedDate": "2023-01-20T19:00:00"
 *     }
 *   },
 *   "expensesCount": 2,
 *   "spending": 100,
 *   "expenses": 200,
 *   "balance": 100
 * }
 */
export interface UserBalance {
	user: User;
	expensesCount: number;
	spending: number;
	expenses: number;
	balance: number;
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = environment.apiUrl + 'users';
	constructor(private httpClient: HttpClient) {}

	loadUsers(excludeSelf: boolean = false) {
		return this.httpClient.get<User[]>(this.apiUrl + (excludeSelf ? '?exclude=self' : ''));
	}

	loadUsersByEvent(eventId: string) {
		return this.httpClient.get<User[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	loadUserById(userId: string) {
		return this.httpClient.get<User>(this.apiUrl + `/${userId}`);
	}

	createUser(eventId: string, name: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, { name: name, eventId: eventId, email: 'email', password: 'password' });
	}

	loadUserExpenses(userId: string, eventId: string): Observable<Expense[]> {
		return this.httpClient.get<Expense[]>(this.apiUrl + `/${userId}/expenses/${eventId}`);
	}

	loadUserBalance(eventId: string): Observable<UserBalance[]> {
		return this.httpClient.get<UserBalance[]>(this.apiUrl + `/balances?eventId=${eventId}`);
	}

	editUser(userId: string, username: string, firstName: string, lastName: string, email: string, phone: string): Observable<User> {
		return this.httpClient.put<User>(this.apiUrl + `/${userId}`, {
			username,
			firstName,
			lastName,
			email,
			phone,
		});
	}

	deleteUser(userId: string, key: string): Observable<User[]> {
		return this.httpClient.delete<User[]>(this.apiUrl + `/${userId}`, { body: { key } });
	}

	registerUser(
		username: string,
		firstName: string,
		lastName: string,
		email: string,
		phone: Phonenumber,
		password: string,
		key?: string
	): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, {
			username,
			firstName,
			lastName,
			email,
			phone: phone.number,
			password,
			key,
		});
	}

	changeUserPassword(currentPassword: string, newPassword: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl + '/changepassword', {
			currentPassword: currentPassword,
			newPassword: newPassword,
		});
	}

	inviteUser(email: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + '/invite', {
			email,
		});
	}

	requestDeleteAccount(): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + '/requestdeleteaccount', {});
	}
}
