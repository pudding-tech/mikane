import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import {
	PuddingEvent,
	EventService,
} from 'src/app/services/event/event.service';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
	selector: 'app-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
	events: PuddingEvent[] = [];
	selectedEvent!: PuddingEvent;

	constructor(
		private eventService: EventService,
		private router: Router,
		private route: ActivatedRoute,
		public dialog: MatDialog,
    private messageService: MessageService,
	) {}

	ngOnInit() {
		this.eventService.loadEvents().subscribe({next: (events) => {
			this.events = events;
		}, error: () => {
            this.messageService.showError('Error loading events');
        }});
	}

	clickEvent(event: PuddingEvent) {
		this.selectedEvent = event;
		this.router.navigate([this.selectedEvent.id, 'users'], {
			relativeTo: this.route,
			state: { event: this.selectedEvent },
		});
	}

	openDialog() {
		const dialogRef = this.dialog.open(EventDialogComponent, {
			width: '350px'
		});

		dialogRef.afterClosed().subscribe((event: string) => {
			if (event) {
				this.eventService.createEvent(event).subscribe((event) => {
					this.events.unshift(event);
				});
			}
		});
	}
}
