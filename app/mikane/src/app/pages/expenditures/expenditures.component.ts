import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, switchMap, takeUntil } from 'rxjs';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { ExpenseItemComponent } from 'src/app/features/mobile/expense-item/expense-item.component';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { MatTableModule } from '@angular/material/table';
import { NgIf, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

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
export class ExpendituresComponent implements OnInit {
	private eventId!: string;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	cancel$: Subject<void> = new Subject();

	expenses: Expense[] = [];
	displayedColumns: string[] = ['name', 'payer', 'amount', 'categoryName', 'description', 'delete'];
	currentUserId: string;

	@ViewChild(MatSort) sort: MatSort;

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private authService: AuthService,
		private route: ActivatedRoute,
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
		this.route?.parent?.parent?.params
			.pipe(
				switchMap((params) => {
					this.eventId = params['eventId'];
					return this.expenseService.loadExpenses(this.eventId);
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
				eventId: this.eventId,
				userId: undefined,
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
					return this.categoryService.findOrCreate(this.eventId, expense?.category);
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
					return this.compare(a.dateAdded, b.dateAdded, false);
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
						return this.compare(a.category.name, b.category.name, isAsc);
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
}
