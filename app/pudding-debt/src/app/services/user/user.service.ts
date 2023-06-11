import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Expense } from '../expense/expense.service';
import { Phonenumber } from 'src/app/types/phonenumber.type';

export interface User {
	id: number;
	uuid: string;
	name: string;
	username: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	created?: Date;
	event?: {
		id: number;
		joinedDate: Date;
	}
	authenticated: boolean;
}

export interface UserBalance {
	user: User;
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

	loadUsersByEvent(eventId: number) {
		return this.httpClient.get<User[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	loadUserById(userId: number) {
		return this.httpClient.get<User>(this.apiUrl + `/${userId}`);
	}

	createUser(eventId: number, name: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, { name: name, eventId: eventId, email: 'email', password: 'password' });
	}

	loadUserExpenses(userId: number, eventId: number): Observable<Expense[]> {
		return this.httpClient.get<Expense[]>(this.apiUrl + `/${userId}/expenses/${eventId}`);
	}

	loadUserBalance(eventId: number): Observable<UserBalance[]> {
		return this.httpClient.get<UserBalance[]>(this.apiUrl + `/balances?eventId=${eventId}`);
	}

	editUser(userId: number, username: string, firstName: string, lastName: string, email: string, phone: Phonenumber): Observable<User> {
		return this.httpClient.put<User>(this.apiUrl + `/${userId}`, {
			username,
			firstName,
			lastName,
			email,
			phone: phone.number,
		});
	}

	deleteUser(userId: number): Observable<User[]> {
		return this.httpClient.delete<User[]>(this.apiUrl + `/${userId}`);
	}

	registerUser(
		username: string,
		firstName: string,
		lastName: string,
		email: string,
		phone: Phonenumber,
		password: string
	): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, {
			username,
			firstName,
			lastName,
			email,
			phone: phone.number,
			password,
		});
	}

	changeUserPassword(currentPassword: string, newPassword: string): Observable<User> {
		return this.httpClient
			.post<User>(this.apiUrl + '/changepassword', {
				currentPassword: currentPassword,
				newPassword: newPassword,
			});
	}
}
