import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of, catchError, finalize, tap } from 'rxjs';
import { Expense } from 'src/app/services/expense/expense.service';
import { UserService } from 'src/app/services/user/user.service';

export class ExpenseDataSource implements DataSource<Expense> {
	private expenseSubject = new BehaviorSubject<Expense[]>([]);
	private loadingSubject = new BehaviorSubject<boolean>(false);

	public loading$ = this.loadingSubject.asObservable();
    public notEmpty = new BehaviorSubject<boolean>(false);

	constructor(private userService: UserService) {}

	connect(
		collectionViewer: CollectionViewer
	): Observable<readonly Expense[]> {
		return this.expenseSubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this.expenseSubject.complete();
		this.loadingSubject.complete();
	}

	loadExpenses(userId: number) {
		this.loadingSubject.next(true);

		this.userService
			.loadUserExpenses(userId)
			.pipe(
				catchError(() => of([])),
				finalize(() => this.loadingSubject.next(false))
			)
			.subscribe((expenses) => {
                this.notEmpty.next(expenses.length > 0);
                this.expenseSubject.next(expenses);
            });
	}

    removeExpense(expenseId: number) {
        const expenses = this.expenseSubject.value;
        const index = expenses.findIndex((expense) => {
            return expense.id === expenseId;
        });
        if (index > -1) {
            expenses.splice(index, 1);
            this.expenseSubject.next(expenses);
        }
    }

    addExpense(expense: Expense) {
        this.expenseSubject.next([...this.expenseSubject.value, expense]);
    }
}
