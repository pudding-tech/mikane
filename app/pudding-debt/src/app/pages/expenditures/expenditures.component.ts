import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';

@Component({
	selector: 'app-expenditures',
	templateUrl: './expenditures.component.html',
	styleUrls: ['./expenditures.component.scss'],
})
export class ExpendituresComponent implements OnInit {
    private eventId!: number;

    expenses: Expense[] = [];

	constructor(
		private expenseService: ExpenseService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
        this.route.parent?.params.subscribe(params => {
            console.log('route params', params);
            this.eventId = params['eventId'];
            this.loadExpenses();
        });
    }

    loadExpenses() {
        this.expenseService.loadExpenses(this.eventId).subscribe((expenses) => {
            this.expenses = expenses;
        })
    }
}
