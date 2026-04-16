import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, EMPTY, Subscription, catchError, combineLatest, map, switchMap, tap } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { Expense } from 'src/app/services/expense/expense.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	templateUrl: 'profile.component.html',
	styleUrls: ['./profile.component.scss'],
	imports: [
		CommonModule,
		MatCardModule,
		ProgressSpinnerComponent,
		MenuComponent,
		MatIconModule,
		MatListModule,
		MatRippleModule,
		RouterLink,
		MatButtonModule,
		MatToolbarModule,
		MatTooltipModule,
		NgOptimizedImage,
	],
})
export class ProfileComponent implements OnInit, OnDestroy {
	breakpointService = inject(BreakpointService);
	private authService = inject(AuthService);
	private userService = inject(UserService);
	private messageService = inject(MessageService);
	private titleService = inject(Title);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private logService = inject(LogService);

	protected loading = new BehaviorSubject<boolean>(false);
	protected loadingEvents = new BehaviorSubject<boolean>(false);
	protected loadingExpenses = new BehaviorSubject<boolean>(false);

	protected user: User;
	protected events = signal<PuddingEvent[]>([]);
	protected expenses = signal<Expense[]>([]);

	private eventsOffset = 5;
	private expensesOffset = 5;
	protected showMoreEvents = true;
	protected showMoreExpenses = true;
	protected hideEventsText = false;
	protected hideExpensesText = false;

	private subscription: Subscription;
	readonly EventStatusType = EventStatusType;

	ngOnInit() {
		this.subscription = this.route.paramMap
			.pipe(
				tap(() => {
					this.loading.next(true);
					this.eventsOffset = 5;
					this.expensesOffset = 5;
					this.showMoreEvents = true;
					this.showMoreExpenses = true;
					this.hideEventsText = false;
					this.hideExpensesText = false;
				}),
				map((params) => {
					return params.get('usernameOrId');
				}),
				switchMap((usernameOrId) => {
					if (usernameOrId) {
						return this.userService.loadUserByUsernameOrId(usernameOrId);
					} else {
						// Username not in URL, showing logged in user profile page
						return this.authService.getCurrentUser().pipe(switchMap((user) => this.userService.loadUserById(user.id)));
					}
				}),
				switchMap((user) => {
					if (user) {
						this.user = user;
						this.titleService.setTitle(`${user.name} | Mikane`);

						return combineLatest([
							this.userService.loadUserEvents(user.id, 5),
							this.userService.loadUserExpenses(user.id, null, 5),
						]);
					} else {
						this.messageService.showError('User not found');
						this.logService.error('User not found on profile page');
						return EMPTY;
					}
				}),
				catchError((err: ApiError) => {
					this.messageService.showError('Something went wrong');
					this.logService.error('Something went wrong while getting user on profile page: ' + err);
					return EMPTY;
				}),
			)
			.subscribe({
				next: ([events, expenses]) => {
					this.events.set(events);
					this.expenses.set(
						expenses.map((expense) => ({
							...expense,
							created: new Date(expense.created),
						})),
					);
					this.loading.next(false);
				},
				error: (error: ApiError) => {
					this.messageService.showError('Something went wrong');
					this.logService.error('Something went wrong when getting user on profile page: ' + error);
					this.router.navigate(['/events']);
				},
			});
	}

	loadMoreEvents() {
		this.loadingEvents.next(true);
		this.userService.loadUserEvents(this.user.id, 5, this.eventsOffset).subscribe({
			next: (events) => {
				this.events.set([...this.events(), ...events]);
				this.eventsOffset += 5;
				if (events.length < 5) {
					this.showMoreEvents = false;
					setTimeout(() => {
						this.hideEventsText = true;
					}, 2000);
				}
				this.loadingEvents.next(false);
			},
			error: (err: ApiError) => {
				this.loadingEvents.next(false);
				this.messageService.showError('Failed to get more events');
				this.logService.error('Something went wrong while retrieving more events: ' + err?.error?.message);
			},
		});
	}

	loadMoreExpenses() {
		this.loadingExpenses.next(true);
		this.userService.loadUserExpenses(this.user.id, null, 5, this.expensesOffset).subscribe({
			next: (expenses) => {
				this.expenses.set([...this.expenses(), ...expenses]);
				this.expensesOffset += 5;
				if (expenses.length < 5) {
					this.showMoreExpenses = false;
					setTimeout(() => {
						this.hideExpensesText = true;
					}, 2000);
				}
				this.loadingExpenses.next(false);
			},
			error: (err: ApiError) => {
				this.loadingExpenses.next(false);
				this.messageService.showError('Failed to get more expenses');
				this.logService.error('Something went wrong while retrieving more expenses: ' + err?.error?.message);
			},
		});
	}

	copyProfileLink() {
		const url = location.origin + '/u/' + this.user.id;
		if (window.isSecureContext && navigator.clipboard) {
			navigator.clipboard.writeText(url);
			this.messageService.showSuccess('Link to profile copied to clipboard');
		} else {
			this.messageService.showError('Copy to clipboard is only allowed in a secure environment');
			this.logService.error('Copy to clipboard is only allowed in a secure environment');
		}
	}

	gotoEvent(id: string) {
		this.router.navigate(['events', id, 'participants']);
	}

	gotoExpenses(expense: Expense) {
		this.breakpointService.isMobile().subscribe((isMobile) => {
			if (isMobile) {
				this.router.navigate(['events', expense.eventInfo.id, 'expenses', expense.id]);
			} else {
				this.router.navigate(['events', expense.eventInfo.id, 'expenses'], {
					queryParams: {
						payers: expense.payer.id,
					},
				});
			}
		});
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}
}
