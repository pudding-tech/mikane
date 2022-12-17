import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { map, combineLatest } from 'rxjs';
import {
	EventService,
	PuddingEvent,
} from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {
	event: PuddingEvent = {
		name: '',
	} as PuddingEvent;
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

	constructor(
		private eventService: EventService,
		private route: ActivatedRoute,
		private router: Router,
		private messageService: MessageService,
		private titleService: Title
	) {
		const event =
			this.router.getCurrentNavigation()?.extras.state?.['event'];
		if (event) {
			this.event = event;
			this.titleService.setTitle(event.name);
		}
	}

	ngOnInit() {
		// Set active link based on current URL
		this.activeLink =
			'./' +
			window.location.href.substring(
				window.location.href.lastIndexOf('/') + 1
			);

		combineLatest([this.eventService.loadEvents(), this.route.params])
			.pipe(
				map(([events, params]) => {
					return events.find((event) => {
						return event.id === +params['eventId'];
					});
				})
			)
			.subscribe({
				next: (event) => {
					if (event) {
						this.event = event;
						this.titleService.setTitle(event.name);
					}
				},
				error: () => {
					this.messageService.showError('Error loading events');
				},
			});
	}
}
