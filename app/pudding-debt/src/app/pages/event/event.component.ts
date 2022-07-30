import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	PuddingEvent,
	EventService,
} from 'src/app/services/event/event.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
})
export class EventComponent implements OnInit {
	events: PuddingEvent[] = [];
	selectedEvent!: PuddingEvent;

	constructor(
		private eventService: EventService,
		private router: Router,
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		this.eventService.loadEvents().subscribe((events) => {
			this.events = events;
			console.log(events);
		});
	}

	clickEvent(event: PuddingEvent) {
		this.selectedEvent = event;
		this.router.navigate([this.selectedEvent.id, 'users'], {
			relativeTo: this.route,
			state: { event: this.selectedEvent.id },
		});
		/* this.userService.loadUsersForEvent(event.id).subscribe((users) => {
			this.users = users;
			console.log(users);
		}); */
	}
}
