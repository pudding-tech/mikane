import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, combineLatest } from 'rxjs';
import {
	EventService,
	PuddingEvent,
} from 'src/app/services/event/event.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {
	event: PuddingEvent = {
        name: 'PUDDING DEBT',
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
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		combineLatest([this.eventService.loadEvents(), this.route.params]).pipe(
			map(([events, params]) => {
				return events.find((event) => {
					return event.id === +params['eventId'];
				});
			})
		).subscribe(event => {
            if (event) {
                this.event = event;
            }
        });
	}
}
