import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { Expense } from 'src/app/services/expense/expense.service';
import { MatListModule } from '@angular/material/list';

@Component({
	selector: 'expense-item',
	templateUrl: 'expense-item.component.html',
	styleUrls: ['./expense-item.component.scss'],
	standalone: true,
	imports: [MatIconModule, CurrencyPipe, MatListModule],
})
export class ExpenseItemComponent {
	@Input('expense') expense: Expense;
}
