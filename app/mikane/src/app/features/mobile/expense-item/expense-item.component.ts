import { CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/services/expense/expense.service';

@Component({
	selector: 'app-expense-item',
	templateUrl: 'expense-item.component.html',
	styleUrls: ['./expense-item.component.scss'],
	imports: [MatIconModule, CurrencyPipe, MatListModule, NgOptimizedImage],
})
export class ExpenseItemComponent {
	private router = inject(Router);
	private route = inject(ActivatedRoute);

	expense = input.required<Expense>();

	gotoExpense() {
		this.router.navigate([this.expense().id], {
			relativeTo: this.route,
			queryParams: { ...this.route.snapshot.queryParams },
		});
	}
}
