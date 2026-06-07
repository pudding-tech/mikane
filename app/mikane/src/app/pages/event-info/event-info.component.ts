import { AsyncPipe, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest, filter, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { EventStatusType, PuddingEvent } from '../../services/event/event.service';
import { LogService } from '../../services/log/log.service';
import { MessageService } from '../../services/message/message.service';
import { User, UserService } from '../../services/user/user.service';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { ApiError } from '../../types/apiError.type';
import { CURRENCIES } from '../../types/constants';

@Component({
	templateUrl: 'event-info.component.html',
	styleUrls: ['./event-info.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatListModule,
		MatInputModule,
		MatSelectModule,
		MatFormFieldModule,
		FormsModule,
		ReactiveFormsModule,
		ProgressSpinnerComponent,
		NgOptimizedImage,
		AsyncPipe,
		NgTemplateOutlet,
	],
})
export class EventInfoComponent implements OnInit, OnDestroy {
	private router = inject(Router);
	private userService = inject(UserService);
	private authService = inject(AuthService);
	breakpointService = inject(BreakpointService);
	private messageService = inject(MessageService);
	private logService = inject(LogService);

	@Input() $event: BehaviorSubject<PuddingEvent>;
	event: PuddingEvent;
	loading = new BehaviorSubject<boolean>(false);
	adminsInEvent: User[];
	currentUser: User;
	eventCurrencyDisplay = '';

	private eventSubscription: Subscription;
	readonly EventStatusType = EventStatusType;

	ngOnInit(): void {
		this.loading.next(true);
		this.eventSubscription = this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event) => {
					this.event = event;
					return combineLatest([this.userService.loadUsersByEvent(event.id, true), this.authService.getCurrentUser()]);
				}),
			)
			.subscribe({
				next: ([users, currentUser]) => {
					this.adminsInEvent = users.filter((user) => user.eventInfo?.isAdmin);
					this.currentUser = currentUser;
					const selectedCurrency = CURRENCIES.find((currency) => currency.code === this.event.currency);
					this.eventCurrencyDisplay = selectedCurrency
						? `${selectedCurrency.name} (${selectedCurrency.code})`
						: (this.event.currency ?? 'Unknown');
					this.loading.next(false);
				},
				error: (err: ApiError) => {
					this.loading.next(false);
					this.messageService.showError('Error loading event settings');
					this.logService.error('Something went wrong while loading event settings data: ' + err?.error?.message);
				},
			});
	}

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
	}
}
