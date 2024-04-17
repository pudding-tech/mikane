import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { EventItemComponent } from 'src/app/features/mobile/event-item/event-item.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ScrollService } from 'src/app/services/scroll/scroll.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { EventDialogComponent } from './event-dialog/event-dialog.component';

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
		EventItemComponent,
		ProgressSpinnerComponent,
		AsyncPipe,
		MatDialogModule,
		MatTooltipModule,
		MatPaginatorModule,
		MenuComponent,
		MatListModule,
	],
})
export class EventsComponent implements OnInit, OnDestroy {
	events = signal<PuddingEvent[]>([]);
	eventsActive = computed(() => {
		return this.events().filter((event) => event.status.id !== EventStatusType.ARCHIVED);
	});
	eventsArchived = computed(() => {
		return this.events().filter((event) => event.status.id === EventStatusType.ARCHIVED);
	});
	pagedEventsActive = computed(() => {
		return this.eventsActive().slice(this.startIndexActive(), this.endIndexActive());
	});
	pagedEventsArchived = computed(() => {
		return this.eventsArchived().slice(this.startIndexArchived(), this.endIndexArchived());
	});

	selectedEvent!: PuddingEvent;
	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	editSubscription: Subscription;
	readonly EventStatusType = EventStatusType;

	// Paginator
	lengthActive = computed(() => {
		return this.eventsActive().length;
	});
	lengthArchived = computed(() => {
		return this.eventsArchived().length;
	});
	pageSizeActive = signal(10);
	pageSizeArchived = signal(10);
	startIndexActive = signal(0);
	startIndexArchived = signal(0);
	endIndexActive = signal(this.pageSizeActive());
	endIndexArchived = signal(this.pageSizeArchived());
	pageSizeOptions: number[] = [5, 10, 20];

	constructor(
		private eventService: EventService,
		private messageService: MessageService,
		private router: Router,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		public breakpointService: BreakpointService,
		public scrollService: ScrollService,
	) {}

	ngOnInit() {
		this.loading.next(true);
		this.eventService.loadEvents().subscribe({
			next: (events) => {
				this.events.set(events);
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
		this.router.navigate([this.selectedEvent.id, 'participants'], {
			relativeTo: this.route,
			state: { event: this.selectedEvent },
		});
	}

	editEvent(editEvent: PuddingEvent) {
		const dialogRef = this.dialog.open(EventDialogComponent, {
			width: '400px',
			data: {
				edit: true,
				event: editEvent,
			},
			autoFocus: false,
		});

		this.editSubscription = dialogRef.afterClosed().subscribe({
			next: (editedEvent: PuddingEvent) => {
				if (editedEvent) {
					this.eventService
						.editEvent({ id: editedEvent.id, name: editedEvent.name, description: editedEvent.description })
						.subscribe({
							next: (result) => {
								const index = this.events().indexOf(this.events().find((event) => event.id === result.id));
								if (~index) {
									this.events.update((events) => {
										events[index] = result;
										return [...events];
									});
								}
							},
							error: (err: ApiError) => {
								this.messageService.showError('Failed to edit event');
								console.error('something went wrong while editing event', err?.error?.message);
							},
						});
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
					next: (newEvent) => {
						this.events.update((events) => {
							events.unshift(newEvent);
							return [...events];
						});
						this.startIndexActive.set(0);
						this.endIndexActive.set(this.pageSizeActive());
					},
					error: (err: ApiError) => {
						this.messageService.showError('Failed to create event');
						console.error('something went wrong while creating event', err?.error?.message);
					},
				});
			}
		});
	}

	onPageChange(pageEvent: PageEvent, type: 'active' | 'archived') {
		const startIndex = pageEvent.pageIndex * pageEvent.pageSize;
		let endIndex = startIndex + pageEvent.pageSize;
		if (type === 'active') {
			if (endIndex > this.lengthActive()) {
				endIndex = this.lengthActive();
			}
			this.startIndexActive.set(startIndex);
			this.endIndexActive.set(endIndex);
			this.pageSizeActive.set(pageEvent.pageSize);
		} else if (type === 'archived') {
			if (endIndex > this.lengthArchived()) {
				endIndex = this.lengthArchived();
			}
			this.startIndexArchived.set(startIndex);
			this.endIndexArchived.set(endIndex);
			this.pageSizeArchived.set(pageEvent.pageSize);
		}
	}

	ngOnDestroy(): void {
		this.editSubscription?.unsubscribe();
	}
}
