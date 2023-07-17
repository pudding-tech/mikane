import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BehaviorSubject, Subject, Subscription, filter, of, switchMap, takeUntil } from 'rxjs';
import { ExpenseItemComponent } from 'src/app/features/mobile/expense-item/expense-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';

@Component({
	selector: 'app-expenditures',
	templateUrl: './expenditures.component.html',
	styleUrls: ['./expenditures.component.scss'],
	standalone: true,
	imports: [
		MatButtonModule,
		MatIconModule,
		NgIf,
		NgFor,
		MatTableModule,
		ProgressSpinnerComponent,
		ExpenseItemComponent,
		MatCardModule,
		AsyncPipe,
		CurrencyPipe,
		MatDialogModule,
		MatListModule,
		MatSortModule,
	],
})
export class ExpendituresComponent implements OnInit, OnDestroy {
	event!: PuddingEvent;

	@Input() $event: BehaviorSubject<PuddingEvent>;
	private eventSubscription: Subscription;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	cancel$: Subject<void> = new Subject();

	expenses: Expense[] = [];
	displayedColumns: string[] = ['icon', 'name', 'payer', 'amount', 'categoryName', 'description', 'delete'];
	currentUserId: string;

	@ViewChild(MatSort) sort: MatSort;

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private authService: AuthService,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.loading.next(true);
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				this.currentUserId = user.id;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to get user');
				console.error('Something went wrong getting signed in user in expenses component: ' + err?.error?.message);
			},
		});
		this.eventSubscription = this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event) => {
					if (event.id) {
						this.event = event;
						return this.expenseService.loadExpenses(this.event.id);
					} else {
						return of([]);
					}
				})
			)
			.subscribe({
				next: (expenses) => {
					this.expenses = expenses;
					this.loading.next(false);
				},
				error: (err: ApiError) => {
					this.loading.next(false);
					this.messageService.showError('Error loading expenses');
					console.error('something went wrong while loading expenses', err?.error?.message);
				},
			});
	}

	openDialog() {
		const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
			width: '350px',
			data: {
				eventId: this.event.id,
				userId: this.currentUserId,
			},
		});

		let newExpense: any;
		dialogRef
			.afterClosed()
			.pipe(
				switchMap((expense) => {
					if (!expense) {
						this.cancel$.next();
					}
					newExpense = expense;
					return this.categoryService.findOrCreate(this.event.id, expense?.category);
				}),
				takeUntil(this.cancel$)
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.createExpense(
						newExpense.name,
						newExpense.description,
						newExpense.amount,
						category.id,
						newExpense.payer
					);
				})
			)
			.subscribe({
				next: (expense) => {
					this.expenses = [expense, ...this.expenses];
					this.messageService.showSuccess('New expense created!');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to create expense');
					console.error('something went wrong while creating expense', err?.error?.message);
				},
			});
	}

	removeExpense(expenseId: string) {
		this.expenseService.deleteExpense(expenseId).subscribe({
			next: () => {
				this.expenses = [
					...this.expenses.filter((expense) => {
						return expense.id !== expenseId;
					}),
				];
				this.messageService.showSuccess('Expense deleted');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to delete expense');
				console.error('something went wrong while deleting expense', err?.error?.message);
			},
		});
	}

	sortData(sort: Sort) {
		if (!sort.active || sort.direction === '') {
			this.expenses = [
				...this.expenses.sort((a, b) => {
					return this.compare(a.created, b.created, false);
				}),
			];
			return;
		}

		this.expenses = [
			...this.expenses.sort((a, b) => {
				const isAsc = sort.direction === 'asc';
				switch (sort.active) {
					case 'name':
						return this.compare(a.name, b.name, isAsc);
					case 'payer':
						return this.compare(a.payer.name, b.payer.name, isAsc);
					case 'categoryName':
						return this.compare(a.categoryInfo.name, b.categoryInfo.name, isAsc);
					case 'amount':
						return this.compare(a.amount, b.amount, isAsc);
					case 'desscription':
						return this.compare(a.description, b.description, isAsc);
					default:
						return 0;
				}
			}),
		];
	}

	private compare(a: string | number, b: string | number, isAsc: boolean) {
		if (a === b) return 0;
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
	}
}
