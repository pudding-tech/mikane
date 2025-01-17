import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, catchError, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { Expense } from 'src/app/services/expense/expense.service';
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

	protected loading = true;
	protected loadingEvents = false;
	protected loadingExpenses = false;

	protected user: User;
	protected events: PuddingEvent[];
	protected expenses: Expense[];

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
					this.loading = true;
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
						console.error('user not found on profile page');
						return of(undefined);
					}
				}),
				catchError((err: ApiError) => {
					this.messageService.showError('Something went wrong');
					console.error('something went wrong while getting user on profile page', err);
					return of(undefined);
				}),
			)
			.subscribe({
				next: ([events, expenses]) => {
					this.events = events;
					this.expenses = expenses.map((expense) => ({
						...expense,
						created: new Date(expense.created),
					}));
					this.loading = false;
				},
				error: (error: ApiError) => {
					this.messageService.showError('Something went wrong');
					console.error('something went wrong when getting user on profile page', error);
					this.router.navigate(['/events']);
				},
			});
	}

	loadMoreEvents() {
		this.loadingEvents = true;
		this.userService.loadUserEvents(this.user.id, 5, this.eventsOffset).subscribe({
			next: (events) => {
				this.events = [...this.events, ...events];
				this.eventsOffset += 5;
				if (events.length < 5) {
					this.showMoreEvents = false;
					setTimeout(() => {
						this.hideEventsText = true;
					}, 2000);
				}
				this.loadingEvents = false;
			},
			error: (err: ApiError) => {
				this.loadingEvents = false;
				this.messageService.showError('Failed to get more events');
				console.error('Something went wrong while retrieving more events', err?.error?.message);
			},
		});
	}

	loadMoreExpenses() {
		this.loadingExpenses = true;
		this.userService.loadUserExpenses(this.user.id, null, 5, this.expensesOffset).subscribe({
			next: (expenses) => {
				this.expenses = [...this.expenses, ...expenses];
				this.expensesOffset += 5;
				if (expenses.length < 5) {
					this.showMoreExpenses = false;
					setTimeout(() => {
						this.hideExpensesText = true;
					}, 2000);
				}
				this.loadingExpenses = false;
			},
			error: (err: ApiError) => {
				this.loadingExpenses = false;
				this.messageService.showError('Failed to get more expenses');
				console.error('Something went wrong while retrieving more expenses', err?.error?.message);
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
			console.error('Copy to clipboard is only allowed in a secure environment');
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
