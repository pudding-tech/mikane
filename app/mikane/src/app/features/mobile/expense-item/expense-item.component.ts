import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from '../../../services/expense/expense.service';
import { AppCurrencyPipe } from '../../../shared/currency/app-currency.pipe';

@Component({
	selector: 'app-expense-item',
	templateUrl: 'expense-item.component.html',
	styleUrls: ['./expense-item.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatIconModule, AppCurrencyPipe, MatListModule, NgOptimizedImage],
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
