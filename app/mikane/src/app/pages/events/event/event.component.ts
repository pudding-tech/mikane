import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { MobileEventNavbarComponent } from 'src/app/features/mobile/mobile-event-navbar/mobile-event-navbar.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, PuddingEvent, EventStatusType } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';
import { CategoryComponent } from '../../category/category.component';
import { EventInfoComponent } from '../../event-info/event-info.component';
import { EventSettingsComponent } from '../../event-settings/event-settings.component';
import { ExpendituresComponent } from '../../expenditures/expenditures.component';
import { ParticipantComponent } from '../../participant/participant.component';

@Component({
	selector: 'app-event',
	templateUrl: './event.component.html',
	styleUrls: ['./event.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatToolbarModule,
		MatButtonModule,
		RouterLink,
		MatIconModule,
		MatTabsModule,
		RouterOutlet,
		MenuComponent,
		MobileEventNavbarComponent,
	],
})
export class EventComponent implements OnInit {
	event: PuddingEvent = {
		name: '',
	} as PuddingEvent;
	$event: BehaviorSubject<PuddingEvent> = new BehaviorSubject<PuddingEvent>(undefined);
	readonly EventStatusType = EventStatusType;

	activeLink = '';
	isMobile = toSignal(this.breakpointService.isMobile());
	isEventAdmin = signal(false);
	links = computed(() => {
		const eventLinks = [
			{
				name: 'Participants',
				icon: 'person',
				location: './participants',
			},
			{
				name: 'Expenses',
				icon: 'payment',
				location: './expenses',
			},
			{
				name: this.isMobile() ? 'Categories' : 'Expense Categories',
				icon: 'category',
				location: './categories',
			},
			{
				name: this.isMobile() ? 'Payments' : 'Payment Structure',
				icon: 'account_balance_wallet',
				location: './payment',
			},
		];

		if (this.isEventAdmin() && !this.isMobile()) {
			eventLinks.push({
				name: 'Settings',
				icon: 'settings',
				location: './settings',
			});
		}
		else if (!this.isEventAdmin() && !this.isMobile()) {
			eventLinks.push({
				name: 'Info',
				icon: 'info',
				location: './info',
			});
		}
		return eventLinks;
	});

	constructor(
		private eventService: EventService,
		private route: ActivatedRoute,
		private router: Router,
		private messageService: MessageService,
		private titleService: Title,
		public breakpointService: BreakpointService,
		public contextService: ContextService
	) {
		const event = this.router.getCurrentNavigation()?.extras.state?.['event'];
		if (event) {
			this.event = event;
			this.isEventAdmin.set(event.userInfo.isAdmin);
			this.titleService.setTitle(event.name);
		}
	}

	onOutletLoaded(component: ExpendituresComponent | EventInfoComponent | EventSettingsComponent | ParticipantComponent | CategoryComponent) {
		if (
			component instanceof ExpendituresComponent ||
			component instanceof EventInfoComponent ||
			component instanceof EventSettingsComponent ||
			component instanceof ParticipantComponent ||
			component instanceof CategoryComponent
		) {
			component.$event = this.$event;
			this.$event.next(this.event);
		}
	}

	ngOnInit() {
		// Set active link based on current URL
		this.activeLink = this.getActiveLinkFromUrl(window.location.href);

		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.activeLink = './' + window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
			}
		});

		combineLatest([this.eventService.loadEvents(), this.route.params])
			.pipe(
				map(([events, params]) => {
					return events.find((event) => {
						return event.id === params['eventId'];
					});
				})
			)
			.subscribe({
				next: (event) => {
					if (event) {
						this.event = event;
						this.isEventAdmin.set(event.userInfo.isAdmin);
						this.titleService.setTitle(event.name);
						this.$event.next(event);
					} else {
						// Event not found, redirect to event list
						this.router.navigate(['/events']);
					}
				},
				error: () => {
					this.messageService.showError('Error loading events');
				},
			});
	}

	getActiveLinkFromUrl(url: string) {
		const lastSegment = url.substring(url.lastIndexOf('/') + 1);
		if (this.isUUID(lastSegment)) {
			return `.${url.substring(url.lastIndexOf('/'), url.lastIndexOf('/', url.lastIndexOf('/') - 1))}`;
		}

		return `./${lastSegment}`;
	}

	isUUID(text: string) {
		const regex = /^[\dA-Fa-f]{8}(?:\b-[\dA-Fa-f]{4}){3}\b-[\dA-Fa-f]{12}$/;
		return regex.test(text);
	}
}
