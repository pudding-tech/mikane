import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Expense } from '../expense/expense.service';

export interface User {
	id: number;
	name: string;
}

export interface UserBalance {
    userId: number,
    spending: number,
    expenses: number,
    balance: number
}

@Injectable({
	providedIn: 'root'
})
export class UserService {  
    private apiUrl = environment.apiUrl + 'users';
    constructor(private httpClient: HttpClient) { }

	loadUsers(eventId: number) {
		return this.httpClient.get<User[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	createUser(eventId: number, name: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, { name: name, eventId: eventId });
	}

    loadUserExpenses(userId: number, eventId: number): Observable<Expense[]> {
        return this.httpClient.get<Expense[]>(this.apiUrl + `/${userId}/expenses/${eventId}`);
    }

    loadUserBalance(eventId: number): Observable<UserBalance[]> {
        return this.httpClient.get<UserBalance[]>(this.apiUrl + `/balances?eventId=${eventId}`);
    }

    deleteUser(userId: number): Observable<User[]> {
        return this.httpClient.delete<User[]>(this.apiUrl + `/${userId}`);
    }
}
