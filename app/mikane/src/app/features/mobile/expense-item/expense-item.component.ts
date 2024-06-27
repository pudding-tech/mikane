import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { Expense } from 'src/app/services/expense/expense.service';

@Component({
	selector: 'app-expense-item',
	templateUrl: 'expense-item.component.html',
	styleUrls: ['./expense-item.component.scss'],
	standalone: true,
	imports: [MatIconModule, CurrencyPipe, MatListModule],
})
export class ExpenseItemComponent {
	expense = input.required<Expense>();

	constructor(private router: Router, private route: ActivatedRoute) {}

	gotoExpense() {
		this.router.navigate([this.expense().id], {
			relativeTo: this.route,
			queryParams: { ...this.route.snapshot.queryParams }
		});
	}
}
