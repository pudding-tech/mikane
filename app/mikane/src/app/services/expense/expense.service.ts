import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../user/user.service';

export interface Expense {
	id: number;
	name: string;
	description: string;
	amount: number;
	categoryId: number;
	categoryName: string;
	dateAdded: Date;
	payer: User;
}

@Injectable({
	providedIn: 'root',
})
export class ExpenseService {
	private apiUrl = environment.apiUrl + 'expenses';

	constructor(private httpClient: HttpClient) {}

	loadExpenses(eventId: number): Observable<Expense[]> {
		return this.httpClient.get<Expense[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	createExpense(
		expenseName: string,
		expenseDescription: string,
		amount: number,
		categoryId: number,
		payerId: number
	): Observable<Expense> {
		return this.httpClient.post<Expense>(this.apiUrl, {
			name: expenseName,
			description: expenseDescription,
			amount: amount,
			categoryId: categoryId,
			payerId: payerId,
		});
	}

	deleteExpense(expenseId: number): Observable<void> {
		return this.httpClient.delete<void>(this.apiUrl + `/${expenseId}`);
	}
}
