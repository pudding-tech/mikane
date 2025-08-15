import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { BehaviorSubject, NEVER, Subscription, combineLatest, filter, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { EventNameValidatorDirective } from 'src/app/shared/forms/validators/async-event-name.validator';
import { ApiError } from 'src/app/types/apiError.type';
import { FormControlPipe } from '../../shared/forms/form-control.pipe';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';

@Component({
	templateUrl: 'event-settings.component.html',
	styleUrls: ['./event-settings.component.scss'],
	providers: [provideNativeDateAdapter()],
	imports: [
		CommonModule,
		MatButtonModule,
		MatCardModule,
		MatDatepickerModule,
		MatDialogModule,
		MatIconModule,
		MatListModule,
		MatInputModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatFormFieldModule,
		FormsModule,
		ReactiveFormsModule,
		ProgressSpinnerComponent,
		EventNameValidatorDirective,
		FormControlPipe,
		NgOptimizedImage,
	],
})
export class EventSettingsComponent implements OnInit, OnDestroy {
	private router = inject(Router);
	private eventService = inject(EventService);
	private userService = inject(UserService);
	private authService = inject(AuthService);
	breakpointService = inject(BreakpointService);
	contextService = inject(ContextService);
	private messageService = inject(MessageService);
	dialog = inject(MatDialog);
	private logService = inject(LogService);

	@Input() $event: BehaviorSubject<PuddingEvent>;
	event: PuddingEvent;
	loading = new BehaviorSubject<boolean>(false);
	eventData: { id?: string; name: string; description: string; private: boolean } = { name: '', description: '', private: false };
	adminsInEvent: User[];
	otherUsersInEvent: User[];
	currentUser: User;

	addExpensesCutoffDate = signal<Date | null>(null);
	notificationsMinDate = new Date();
	emailReadyToSettleSentLoading = false;
	emailReminderSentLoading = false;

	addAdminForm = new FormGroup({
		userId: new FormControl('', [Validators.required]),
	}) as FormGroup;

	readonly EventStatusType = EventStatusType;
	private eventSubscription: Subscription;
	private deleteSubscription: Subscription;
	private emailSubscription: Subscription;

	ngOnInit(): void {
		this.loading.next(true);
		this.eventSubscription = this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event) => {
					this.event = event;
					this.eventData.id = event.id;
					this.eventData.name = event.name;
					this.eventData.description = event.description;
					this.eventData.private = event.private;
					return combineLatest([this.userService.loadUsersByEvent(event.id, true), this.authService.getCurrentUser()]);
				}),
			)
			.subscribe({
				next: ([users, currentUser]) => {
					this.adminsInEvent = users.filter((user) => user.eventInfo?.isAdmin);
					this.otherUsersInEvent = users.filter((user) => !user.eventInfo?.isAdmin);
					this.currentUser = currentUser;
					this.loading.next(false);
				},
				error: (err: ApiError) => {
					this.loading.next(false);
					this.messageService.showError('Error loading event settings');
					this.logService.error('Something went wrong while loading event settings data: ' + err?.error?.message);
				},
			});
	}

	editEvent() {
		this.eventService
			.editEvent({
				id: this.event.id,
				name: this.eventData.name,
				description: this.eventData.description,
				privateEvent: this.eventData.private,
			})
			.subscribe({
				next: (event) => {
					this.event = event;
					this.messageService.showSuccess('Event successfully edited');

					// Reload to refresh edited event
					this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
						this.router.navigate(['events', this.event.id, 'settings']);
					});
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to edit event');
					this.logService.error('Something went wrong while editing event: ' + err?.error?.message);
				},
			});
	}

	setStatus(status: EventStatusType) {
		this.eventService.editEvent({ id: this.event.id, status: status }).subscribe({
			next: (event) => {
				this.event = event;
				if (status === EventStatusType.ACTIVE) {
					this.messageService.showSuccess('Event successfully set as active');
				} else if (status === EventStatusType.READY_TO_SETTLE) {
					this.messageService.showSuccess('Event successfully ready to be settled');
				} else if (status === EventStatusType.SETTLED) {
					this.messageService.showSuccess('Event successfully settled');
				}

				// Reload to refresh event
				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
					this.router.navigate(['events', this.event.id, 'settings']);
				});
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to change event status');
				this.logService.error('Something went wrong while changing event status: ' + err?.error?.message);
			},
		});
	}

	deleteEvent() {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '350px',
			data: {
				title: 'Delete event',
				content: 'Are you sure you want to delete this event? This cannot be undone.',
				confirm: 'Yes, I am sure',
			},
		});

		this.deleteSubscription = dialogRef
			.afterClosed()
			.pipe(
				switchMap((confirm) => {
					if (confirm) {
						return this.eventService.deleteEvent(this.event.id);
					} else {
						return NEVER;
					}
				}),
			)
			.subscribe({
				next: () => {
					this.messageService.showSuccess('Event deleted successfully');
					this.router.navigate(['/events']);
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to delete event');
					this.logService.error('Something went wrong while deleting event: ' + err?.error?.message);
				},
			});
	}

	addAdmin() {
		const newAdminId = this.addAdminForm.value.userId;
		if (newAdminId) {
			this.eventService.setUserAsAdmin(this.event.id, newAdminId).subscribe({
				next: (res) => {
					this.event = res;
					const newAdmin = this.otherUsersInEvent.find((user) => user.id === newAdminId && res.adminIds.includes(newAdminId));
					const index = this.otherUsersInEvent.findIndex((user) => user.id === newAdminId && res.adminIds.includes(newAdminId));
					this.adminsInEvent.push(newAdmin);
					this.otherUsersInEvent.splice(index, 1);

					this.addAdminForm.get('userId')?.setValue('');
					this.addAdminForm.get('userId')?.markAsUntouched();
					this.messageService.showSuccess('Admin added successfully');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to add admin');
					this.logService.error('Something went wrong while setting admin for event: ' + err?.error?.message);
				},
			});
		}
	}

	removeAdmin(userId: string) {
		if (userId === this.currentUser.id) {
			const dialogRef = this.dialog.open(ConfirmDialogComponent, {
				width: '350px',
				data: {
					title: 'Remove yourself as admin?',
					content:
						'Are you sure you want to remove yourself as admin for this event? This means you will lose access to this page, and cannot edit this event anymore.',
					confirm: 'Yes, I am sure',
				},
			});

			dialogRef
				.afterClosed()
				.pipe(
					switchMap((confirm) => {
						if (confirm) {
							return this.eventService.removeUserAsAdmin(this.event.id, userId);
						} else {
							return NEVER;
						}
					}),
				)
				.subscribe({
					next: () => {
						this.messageService.showSuccess('Admin removed successfully');
						this.router.navigate(['/events']);
					},
					error: (err: ApiError) => {
						this.messageService.showError('Failed to remove current user as admin');
						this.logService.error('Something went wrong while removing admin from event: ' + err?.error?.message);
					},
				});
		} else {
			this.eventService.removeUserAsAdmin(this.event.id, userId).subscribe({
				next: (res) => {
					this.event = res;
					const index = this.adminsInEvent.findIndex((user) => user.id === userId && !res.adminIds.includes(userId));
					const user = this.adminsInEvent.find((admin) => admin.id === userId && !res.adminIds.includes(userId));
					this.adminsInEvent.splice(index, 1);
					this.otherUsersInEvent.push(user);
					this.messageService.showSuccess('Admin removed successfully');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to remove admin');
					this.logService.error('Something went wrong while removing admin from event: ' + err?.error?.message);
				},
			});
		}
	}

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}

	sendReadyToSettleEmails() {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '420px',
			data: {
				title: "Send 'ready to settle' email",
				content: "Are you sure you want to send the 'ready to settle' email? Emails will be sent to all payers in the event.",
				confirm: 'Yes, I am sure',
			},
		});

		this.emailSubscription = dialogRef
			.afterClosed()
			.pipe(
				switchMap((confirm) => {
					if (confirm) {
						this.emailReadyToSettleSentLoading = true;
						return this.eventService.sendReadyToSettleEmails(this.event.id);
					} else {
						return NEVER;
					}
				}),
			)
			.subscribe({
				next: () => {
					this.emailReadyToSettleSentLoading = false;
					this.messageService.showSuccess('Emails successfully sent');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to send emails');
					this.logService.error('Something went wrong while sending emails: ' + err?.error?.message);
				},
			});
	}

	sendAddExpensesReminderEmails() {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '420px',
			data: {
				title: "Send 'add expenses reminder' email",
				content:
					"Are you sure you want to send the 'add expenses reminder' email? Emails will be sent to all participants in the event.",
				confirm: 'Yes, I am sure',
			},
		});

		this.emailSubscription = dialogRef
			.afterClosed()
			.pipe(
				switchMap((confirm) => {
					if (confirm) {
						this.emailReminderSentLoading = true;
						return this.eventService.sendAddExpensesReminderEmails(this.event.id, this.addExpensesCutoffDate());
					} else {
						return NEVER;
					}
				}),
			)
			.subscribe({
				next: () => {
					this.emailReminderSentLoading = false;
					this.addExpensesCutoffDate.set(null);
					this.messageService.showSuccess('Emails successfully sent');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to send emails');
					this.logService.error('Something went wrong while sending emails: ' + err?.error?.message);
				},
			});
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
		this.deleteSubscription?.unsubscribe();
		this.emailSubscription?.unsubscribe();
	}
}
