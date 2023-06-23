import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor, CurrencyPipe } from '@angular/common';

@Component({
	selector: 'expense-item',
	templateUrl: 'expense-item.component.html',
	styleUrls: ['./expense-item.component.scss'],
	standalone: true,
  imports: [
    MatIconModule,
    NgIf,
    NgFor,
    CurrencyPipe
  ]
})
export class ExpenseItemComponent {
	
}
