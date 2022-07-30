import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from '../category/category.service';
import { PuddingEvent } from '../event/event.service';
import { User } from '../user/user.service';

export interface Expense {
	id: number;
	name: string;
	description: string;
    amount: number;
    payer: string;
}

@Injectable({
	providedIn: 'root',
})
export class ExpenseService {
	private apiUrl = environment.apiUrl + 'expenses';

	constructor(private httpClient: HttpClient) {}

	loadExpenses(eventId: number): Observable<Expense[]> {
		return this.httpClient.get<Expense[]>(
			this.apiUrl + `?eventId=${eventId}`
		);
	}

	createExpense(
		expenseName: string,
        expenseDescription: string,
        amount: number,
		category: string,
		user: string
	): Observable<Expense[]> {
		return this.httpClient.post<Expense[]>(this.apiUrl, {
			name: expenseName,
			description: expenseDescription,
            amount: amount,
			categoryId: category,
			userId: user,
		});
	}
}
