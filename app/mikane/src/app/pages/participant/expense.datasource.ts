import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject, catchError, finalize, of } from 'rxjs';
import { Expense } from '../../services/expense/expense.service';
import { UserService } from '../../services/user/user.service';
import { ApiError } from '../../types/apiError.type';

export class ExpenseDataSource implements DataSource<Expense> {
	private expenseSubject = new BehaviorSubject<Expense[]>([]);
	private loadingSubject = new BehaviorSubject<boolean>(false);
	private errorSubject = new Subject<ApiError>();

	public loading$ = this.loadingSubject.asObservable();
	public notEmpty = new BehaviorSubject<boolean>(false);
	public error$ = this.errorSubject.asObservable();

	constructor(private userService: UserService) {}

	connect(): Observable<readonly Expense[]> {
		return this.expenseSubject.asObservable();
	}

	disconnect(): void {
		this.loadingSubject.complete();
	}

	destroy() {
		this.expenseSubject.complete();
		this.errorSubject.complete();
	}

	loadExpenses(userId: string, eventId: string) {
		this.loadingSubject.next(true);

		this.userService
			.loadUserExpenses(userId, eventId)
			.pipe(
				catchError((err) => {
					this.errorSubject.next(err);
					return of([]);
				}),
				finalize(() => this.loadingSubject.next(false)),
			)
			.subscribe((expenses) => {
				this.notEmpty.next(expenses.length > 0);
				this.expenseSubject.next(expenses);
			});
	}

	removeExpense(expenseId: string) {
		const expenses = this.expenseSubject.value;
		const index = expenses.findIndex((expense) => {
			return expense.id === expenseId;
		});
		if (index > -1) {
			expenses.splice(index, 1);
			this.expenseSubject.next(expenses);
		}
		this.notEmpty.next(this.expenseSubject.value.length > 0);
	}

	addExpense(expense: Expense) {
		this.expenseSubject.next([...this.expenseSubject.value, expense]);
		this.notEmpty.next(this.expenseSubject.value.length > 0);
	}
}
