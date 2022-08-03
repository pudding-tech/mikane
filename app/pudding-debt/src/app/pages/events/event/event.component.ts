import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PuddingEvent } from 'src/app/services/event/event.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
})
export class EventComponent {
	event: PuddingEvent;
  activeLink = '';
	links = [
		{
			name: 'Participants',
			location: './users',
		},
		{
			name: 'Expenses',
			location: './expenses',
		},
		{
			name: 'Expense Categories',
			location: './categories',
		},
		{
			name: 'Payment Structure',
			location: './payment',
		},
	];

	constructor(private router: Router) {
		this.event =
			this.router.getCurrentNavigation()?.extras.state?.['event'] ?? {};
		console.log('event', this.event);
	}
}
