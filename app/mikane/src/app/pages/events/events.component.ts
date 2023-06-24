import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PuddingEvent, EventService } from 'src/app/services/event/event.service';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { MessageService } from 'src/app/services/message/message.service';
import { BehaviorSubject, NEVER, Subscription, switchMap } from 'rxjs';
import { ApiError } from 'src/app/types/apiError.type';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { MatCardModule } from '@angular/material/card';
import { NgIf, NgFor, AsyncPipe, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';

@Component({
	selector: 'app-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
		RouterLink,
		MatIconModule,
		NgIf,
		MatCardModule,
		NgFor,
		ProgressSpinnerComponent,
		AsyncPipe,
		MatDialogModule,
		MatTooltipModule,
		MatPaginatorModule,
		MenuComponent,
	],
})
export class EventsComponent implements OnInit, OnDestroy {
	events: PuddingEvent[] = [];
	pagedEvents: PuddingEvent[] = [];
	selectedEvent!: PuddingEvent;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	editSubscription: Subscription;
	deleteSubscription: Subscription;

	// Paginator
	length: number = 0;
	pageSize: number = 10;
	pageSizeOptions: number[] = [5, 10, 20];

	constructor(
		private eventService: EventService,
		private router: Router,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit() {
		this.loading.next(true);
		this.eventService.loadEvents().subscribe({
			next: (events) => {
				this.events = events;
				this.pagedEvents = events.slice(0, this.pageSize);
				this.length = events.length;
				this.loading.next(false);
			},
			error: () => {
				this.messageService.showError('Error loading events');
				this.loading.next(false);
			},
		});
	}

	clickEvent(event: PuddingEvent) {
		this.selectedEvent = event;
		this.router.navigate([this.selectedEvent.id, 'users'], {
			relativeTo: this.route,
			state: { event: this.selectedEvent },
		});
	}

	editEvent(event: PuddingEvent) {
		const dialogRef = this.dialog.open(EventDialogComponent, {
			width: '400px',
			data: {
				edit: true,
				event,
			},
			autoFocus: false,
		});

		this.editSubscription = dialogRef.afterClosed().subscribe({
			next: (event: PuddingEvent) => {
				if (event) {
					this.eventService.editEvent(event).subscribe({
						next: (result) => {
							const index = this.events.indexOf(this.events.find((event) => event.id === result.id));
							if (~index) {
								this.events[index] = result;
							}
						},
						error: (err: ApiError) => {
							this.messageService.showError('Faild to edit event');
							console.error('something went wrong while editing event', err?.error?.message);
						},
					});
				}
			},
		});
	}

	deleteEvent(deleteEvent: PuddingEvent) {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '350px',
			data: {
				title: 'Delete event',
				content: 'Are you sure you want to delete this event? This can not be undone.',
				confirm: 'Yes, I am sure',
			},
		});

		this.deleteSubscription = dialogRef
			.afterClosed()
			.pipe(
				switchMap((confirm) => {
					if (confirm) {
						return this.eventService.deleteEvent(deleteEvent.id);
					} else {
						return NEVER;
					}
				})
			)
			.subscribe({
				next: () => {
					this.messageService.showSuccess('Event deleted successfully');
					const index = this.events.indexOf(this.events.find((event) => event.id === deleteEvent.id));
					if (~index) {
						this.events.splice(index, 1);
					}
				},
			});
	}

	openDialog() {
		const dialogRef = this.dialog.open(EventDialogComponent, {
			width: '350px',
		});

		dialogRef.afterClosed().subscribe((event: { name: string; description: string }) => {
			if (event) {
				this.eventService.createEvent(event).subscribe({
					next: (event) => {
						this.events.unshift(event);
						this.router.navigate([event.id, 'users'], {
							relativeTo: this.route,
							state: { event: event },
						});
					},
					error: (err: ApiError) => {
						this.messageService.showError('Failed to create event');
						console.error('something went wrong while creating event', err?.error?.message);
					},
				});
			}
		});
	}

	onPageChange(event: PageEvent) {
		const startIndex = event.pageIndex * event.pageSize;
		let endIndex = startIndex + event.pageSize;
		if (endIndex > this.length) {
			endIndex = this.length;
		}
		this.pagedEvents = this.events.slice(startIndex, endIndex);
	}

	ngOnDestroy(): void {
		this.editSubscription?.unsubscribe();
		this.deleteSubscription?.unsubscribe();
	}
}
