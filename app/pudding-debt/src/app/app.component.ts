import { Component, ElementRef, OnInit } from '@angular/core';
import { Category, CategoryService } from './services/category/category.service';
import { EventService, PuddingEvent } from './services/event/event.service';
import { Expense, ExpenseService } from './services/expense/expense.service';
import { User, UserService } from './services/user/user.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	title = 'pudding-debt';

	events: PuddingEvent[] = [];
	selectedEvent!: PuddingEvent;
	users: User[] = [];
    categories: Category[] = [];
    expenses: Expense[] = [];

	constructor(private userService: UserService, private eventService: EventService, private categoryService: CategoryService, private expenseService: ExpenseService) {}

	ngOnInit() {
		this.eventService.loadEvents().subscribe((events) => {
			this.events = events;
			console.log(events);
		});
	}

	clickEvent(event: PuddingEvent) {
		this.selectedEvent = event;
		this.userService.loadUsersForEvent(event.id).subscribe((users) => {
			this.users = users;
			console.log(users);
		});
        this.categoryService.loadCategories(this.selectedEvent.id).subscribe((categories) => {
            this.categories = categories;
        });
	}

    createExpense(expenseName: HTMLInputElement, expenseAmount: HTMLInputElement, expenseComment: HTMLInputElement, expenseParticipant: HTMLSelectElement, expenseCategory: HTMLSelectElement) {
        this.expenseService.createExpense(expenseName.value, expenseComment.value, parseFloat(expenseAmount.value), expenseCategory.value, expenseParticipant.value).subscribe((expenses) => {
            this.expenses = expenses;
        });
    }

	createUser(nameInput: HTMLInputElement) {
		console.log('nameinput', nameInput.value);

        this.userService.createUser(nameInput.value, this.selectedEvent).subscribe((users) => {
			this.users = users;
			console.log(users);
		});
	}
}
