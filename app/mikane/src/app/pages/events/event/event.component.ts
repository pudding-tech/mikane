import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventService, PuddingEvent } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
	standalone: true,
	imports: [CommonModule, MatToolbarModule, MatButtonModule, RouterLink, MatIconModule, MatTabsModule, RouterOutlet, MenuComponent],
})
export class EventComponent implements OnInit {
	event: PuddingEvent = {
		name: '',
	} as PuddingEvent;
	activeLink = '';
	isMobile = toSignal(this.breakpointService.isMobile());
	links = computed(() => [
		{
			name: 'Participants',
			location: './users',
		},
		{
			name: 'Expenses',
			location: './expenses',
		},
		{
			name: this.isMobile() ? 'Categories' : 'Expense Categories',
			location: './categories',
		},
		{
			name: this.isMobile() ? 'Payments' : 'Payment Structure',
			location: './payment',
		},
	]);

	constructor(
		private eventService: EventService,
		private route: ActivatedRoute,
		private router: Router,
		private messageService: MessageService,
		private titleService: Title,
		public breakpointService: BreakpointService
	) {
		const event = this.router.getCurrentNavigation()?.extras.state?.['event'];
		if (event) {
			this.event = event;
			this.titleService.setTitle(event.name);
		}
	}

	ngOnInit() {
		// Set active link based on current URL
		this.activeLink = './' + window.location.href.substring(window.location.href.lastIndexOf('/') + 1);

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