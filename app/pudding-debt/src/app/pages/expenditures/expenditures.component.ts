import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, switchMap, takeUntil } from 'rxjs';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';

@Component({
	selector: 'app-expenditures',
	templateUrl: './expenditures.component.html',
	styleUrls: ['./expenditures.component.scss'],
})
export class ExpendituresComponent implements OnInit {
	private eventId!: number;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	cancel$: Subject<void> = new Subject();

	expenses: Expense[] = [];
	displayedColumns: string[] = ['name', 'payer', 'amount', 'categoryName', 'description', 'delete'];

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private messageService: MessageService
	) {}

	ngOnInit(): void {
		this.loading.next(true);
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

	removeExpense(expenseId: number) {
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
}
