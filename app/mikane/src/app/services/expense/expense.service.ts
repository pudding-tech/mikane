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
	expenseDate?: Date;
	created: Date;
	categoryInfo: {
		id: string;
		name: string;
		icon: string;
	};
	eventInfo: {
		id: string;
		name: string;
		private: boolean;
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

	getExpense(id: string): Observable<Expense> {
		return this.httpClient.get<Expense>(`${this.apiUrl}/${id}`);
	}

	createExpense(
		expenseName: string,
		expenseDescription: string,
		amount: number,
		categoryId: string,
		payerId: string,
		expenseDate: Date
	): Observable<Expense> {
		return this.httpClient.post<Expense>(this.apiUrl, {
			name: expenseName,
			description: expenseDescription,
			amount: amount,
			categoryId: categoryId,
			payerId: payerId,
			expenseDate: expenseDate,
		});
	}

	editExpense(
		expenseId: string,
		name: string,
		description: string,
		amount: number,
		categoryId: string,
		payerId: string,
		expenseDate: Date
	): Observable<Expense> {
		return this.httpClient.put<Expense>(this.apiUrl + `/${expenseId}`, {
			name,
			description,
			amount,
			categoryId,
			payerId,
			expenseDate,
		});
	}

	deleteExpense(expenseId: string): Observable<void> {
		return this.httpClient.delete<void>(this.apiUrl + `/${expenseId}`);
	}
}
