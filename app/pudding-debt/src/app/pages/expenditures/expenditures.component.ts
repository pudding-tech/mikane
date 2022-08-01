import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, of, switchMap } from 'rxjs';
import {
	Category,
	CategoryService,
} from 'src/app/services/category/category.service';
import {
	Expense,
	ExpenseService,
} from 'src/app/services/expense/expense.service';
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
	];

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private route: ActivatedRoute,
		public dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.route.parent?.params.subscribe((params) => {
			console.log('route params', params);
			this.eventId = params['eventId'];
			this.loadExpenses();
		});
	}

	loadExpenses() {
		this.expenseService.loadExpenses(this.eventId).subscribe((expenses) => {
			this.expenses = expenses;
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
        this.categoryService.loadCategories(this.eventId).pipe(
            map((categories): Category | undefined => {
                return categories.find((category) => category.name === expense?.categoryName);
            }), switchMap((category) => {
                if (category) {
                    return of(category);
                } else {
                    return this.categoryService.createCategory(expense.categoryName, this.eventId);
                }
            }) 
        ).subscribe((category) => {
            this.createExpense(category, expense);
        });
    }
    
    createExpense(category: Category, expense: any) {
        this.expenseService.createExpense(expense.name, expense.description, expense.amount, category.id, expense.payer).subscribe((expense) => {
            this.expenses = [...this.expenses, expense];
        });
    }
}
