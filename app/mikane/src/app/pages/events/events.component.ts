import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
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
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
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
	private eventService = inject(EventService);
	private messageService = inject(MessageService);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	dialog = inject(MatDialog);
	breakpointService = inject(BreakpointService);
	scrollService = inject(ScrollService);

	events = signal<PuddingEvent[]>([]);
	eventsActive = computed(() => {
		return this.events().filter((event) => event.status.id !== EventStatusType.SETTLED);
	});
	eventsSettled = computed(() => {
		return this.events().filter((event) => event.status.id === EventStatusType.SETTLED);
	});
	pagedEventsActive = computed(() => {
		return this.eventsActive().slice(this.startIndexActive(), this.endIndexActive());
	});
	pagedEventsSettled = computed(() => {
		return this.eventsSettled().slice(this.startIndexSettled(), this.endIndexSettled());
	});

	selectedEvent!: PuddingEvent;
	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	editSubscription: Subscription;
	readonly EventStatusType = EventStatusType;

	// Paginator
	lengthActive = computed(() => {
		return this.eventsActive().length;
	});
	lengthSettled = computed(() => {
		return this.eventsSettled().length;
	});
	pageSizeActive = signal(10);
	pageSizeSettled = signal(10);
	startIndexActive = signal(0);
	startIndexSettled = signal(0);
	endIndexActive = signal(this.pageSizeActive());
	endIndexSettled = signal(this.pageSizeSettled());
	pageSizeOptions: number[] = [5, 10, 20];

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
			data: {
				edit: false,
			},
		});

		dialogRef.afterClosed().subscribe((event: { name: string; description: string; private: boolean }) => {
			if (event) {
				this.eventService.createEvent({ name: event.name, description: event.description, privateEvent: event.private }).subscribe({
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

	onPageChange(pageEvent: PageEvent, type: 'active' | 'settled') {
		const startIndex = pageEvent.pageIndex * pageEvent.pageSize;
		let endIndex = startIndex + pageEvent.pageSize;
		if (type === 'active') {
			if (endIndex > this.lengthActive()) {
				endIndex = this.lengthActive();
			}
			this.startIndexActive.set(startIndex);
			this.endIndexActive.set(endIndex);
			this.pageSizeActive.set(pageEvent.pageSize);
		} else if (type === 'settled') {
			if (endIndex > this.lengthSettled()) {
				endIndex = this.lengthSettled();
			}
			this.startIndexSettled.set(startIndex);
			this.endIndexSettled.set(endIndex);
			this.pageSizeSettled.set(pageEvent.pageSize);
		}
	}

	ngOnDestroy(): void {
		this.editSubscription?.unsubscribe();
	}
}
