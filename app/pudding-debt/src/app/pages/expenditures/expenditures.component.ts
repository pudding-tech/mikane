import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import {
	Category,
	CategoryService,
} from 'src/app/services/category/category.service';
import {
	Expense,
	ExpenseService,
} from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';

@Component({
	selector: 'app-expenditures',
	templateUrl: './expenditures.component.html',
	styleUrls: ['./expenditures.component.scss'],
})
export class ExpendituresComponent implements OnInit {
	private eventId!: number;

	expenses: Expense[] = [];
	displayedColumns: string[] = [
		'name',
		'payer',
		'amount',
		'categoryName',
		'description',
		'delete',
	];

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private messageService: MessageService
	) {}

	ngOnInit(): void {
		this.route.parent?.params.subscribe((params) => {
			console.log('route params', params);
			this.eventId = params['eventId'];
			this.loadExpenses();
		});
	}

	loadExpenses() {
		this.expenseService.loadExpenses(this.eventId).subscribe({
			next: (expenses) => {
				this.expenses = expenses;
			},
			error: () => {
				this.messageService.showError('Error loading expenses');
			},
		});
	}

	openDialog() {
		const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
			width: '350px',
			data: this.eventId,
		});

		dialogRef.afterClosed().subscribe((expense) => {
			if (expense) {
				this.findCategory(expense);
			}
		});
	}

	findCategory(expense: any) {
		this.categoryService
			.loadCategories(this.eventId)
			.pipe(
				map((categories): Category | undefined => {
					return categories.find(
						(category) => category.name === expense?.categoryName
					);
				}),
				switchMap((category) => {
					if (category) {
						return of(category);
					} else {
						return this.categoryService.createCategory(
							expense.categoryName,
							this.eventId
						);
					}
				})
			)
			.subscribe({
				next: (category) => {
					this.createExpense(category, expense);
				},
				error: () => {
					this.messageService.showError('Error loading categories');
				},
			});
	}

	createExpense(category: Category, expense: any) {
		this.expenseService
			.createExpense(
				expense.name,
				expense.description,
				expense.amount,
				category.id,
				expense.payer
			)
			.subscribe({
				next: (expense) => {
					this.expenses = [...this.expenses, expense];
					this.messageService.showSuccess('New expense created!');
				},
				error: () => {
					this.messageService.showError('Failed to create expense');
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
			error: () => {
				this.messageService.showError('Failed to delete expense');
			},
		});
	}
}
