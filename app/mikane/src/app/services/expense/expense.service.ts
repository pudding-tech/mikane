import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { User } from '../user/user.service';

export interface Expense {
	id: string;
	name: string;
	description: string;
	amount: number;
	created: number;
	categoryInfo: {
		id: string;
		name: string;
		icon: string;
	};
	payer: User;
}

@Injectable({
	providedIn: 'root',
})
export class ExpenseService {
	private apiUrl = this.env.apiUrl + 'expenses';

	constructor(private httpClient: HttpClient, @Inject(ENV) private env: Environment) {}

	loadExpenses(eventId: string): Observable<Expense[]> {
		return this.httpClient.get<Expense[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	createExpense(
		expenseName: string,
		expenseDescription: string,
		amount: number,
		categoryId: string,
		payerId: string
	): Observable<Expense> {
		return this.httpClient.post<Expense>(this.apiUrl, {
			name: expenseName,
			description: expenseDescription,
			amount: amount,
			categoryId: categoryId,
			payerId: payerId,
		});
	}

	editExpense(
		expenseId: string,
		name: string,
		description: string,
		amount: number,
		categoryId: string,
		payerId: string
	): Observable<Expense> {
		return this.httpClient.put<Expense>(this.apiUrl + `/${expenseId}`, {
			name,
			description,
			amount,
			categoryId,
			payerId,
		});
	}

	deleteExpense(expenseId: string): Observable<void> {
		return this.httpClient.delete<void>(this.apiUrl + `/${expenseId}`);
	}
}
