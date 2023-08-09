import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject, NEVER, Subscription, combineLatest, filter, switchMap } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventService, PuddingEvent } from 'src/app/services/event/event.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ProgressSpinnerComponent } from "../../shared/progress-spinner/progress-spinner.component";
import { ApiError } from 'src/app/types/apiError.type';
import { EventNameValidatorDirective } from 'src/app/shared/forms/validators/async-event-name.validator';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { FormControlPipe } from "../../shared/forms/form-control.pipe";

@Component({
    selector: 'event-settings',
    templateUrl: 'event-settings.component.html',
    styleUrls: ['./event-settings.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatListModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        ProgressSpinnerComponent,
        EventNameValidatorDirective,
        FormControlPipe
    ]
})
export class EventSettingsComponent {
	@Input() $event: BehaviorSubject<PuddingEvent>;
	event: PuddingEvent;
	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	eventData: { id?: string; name: string; description: string } = { name: '', description: '' };
	adminsInEvent: User[];
	otherUsersInEvent: User[];
	currentUser: User;

	addAdminForm = new FormGroup({
		userId: new FormControl('', [Validators.required]),
	}) as FormGroup;

	private eventSubscription: Subscription;
	private deleteSubscription: Subscription;
	
	constructor(
		private router: Router,
		private eventService: EventService,
		private userService: UserService,
		private authService: AuthService,
		public breakpointService: BreakpointService,
		private messageService: MessageService,
		public dialog: MatDialog,
	) {}

	ngOnInit(): void {
		this.loading.next(true);
		this.eventSubscription = this.$event
			.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event) => {
					this.event = event;
					this.eventData.id = event.id;
					this.eventData.name = event.name;
					this.eventData.description = event.description;
					return combineLatest([
						this.userService.loadUsersByEvent(event.id),
						this.authService.getCurrentUser()
					]);
				})
			)
			.subscribe({
				next: ([users, currentUser]) => {
					this.adminsInEvent = users.filter(user => user.eventInfo?.isAdmin);
					this.otherUsersInEvent = users.filter(user => !user.eventInfo?.isAdmin);
					this.currentUser = currentUser;
					this.loading.next(false);
				},
				error: (err: ApiError) => {
					this.loading.next(false);
					this.messageService.showError('Error loading event settings');
					console.error('Something went wrong while loading event settings data', err?.error?.message);
				},
			});
	};

	editEvent() {
		this.eventService.editEvent({ id: this.event.id, name: this.eventData.name, description: this.eventData.description }).subscribe({
			next: (event) => {
				this.event = event;
				this.messageService.showSuccess('Event successfully edited');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to edit event');
				console.error('Something went wrong while editing event', err?.error?.message);
			},
		});
	}

	archiveEvent(archive: boolean) {
		this.eventService.editEvent({ id: this.event.id, active: !archive }).subscribe({
			next: (event) => {
				this.event = event;
				this.messageService.showSuccess(archive ? 'Event successfully archived' : 'Event successfully set as active');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to archive event');
				console.error('Something went wrong while archiving event', err?.error?.message);
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
				})
			)
			.subscribe({
				next: () => {
					this.messageService.showSuccess('Event deleted successfully');
					this.router.navigate(['/events']);
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to delete event');
					console.error('Something went wrong while deleting event', err?.error?.message);
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
					console.error('Something went wrong while setting admin for event', err?.error?.message);
				}
			})
		}
	}

	removeAdmin(userId: string) {
		if (userId === this.currentUser.id) {
			const dialogRef = this.dialog.open(ConfirmDialogComponent, {
				width: '350px',
				data: {
					title: 'Remove yourself as admin?',
					content: 'Are you sure you want to remove yourself as admin for this event? This means you will lose access to this page, and cannot edit this event anymore.',
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
					})
				)
				.subscribe({
					next: () => {
						this.messageService.showSuccess('Admin removed successfully');
						this.router.navigate(['/events']);
					},
					error: (err: ApiError) => {
						this.messageService.showError('Failed to remove admin');
						console.error('Something went wrong while removing admin from event', err?.error?.message);
					}
				});
		}
		else {
			this.eventService.removeUserAsAdmin(this.event.id, userId).subscribe({
				next: (res) => {
					this.event = res;
					const index = this.adminsInEvent.findIndex((user) => user.id === userId && !res.adminIds.includes(userId));
					const user = this.adminsInEvent.find((user) => user.id === userId && !res.adminIds.includes(userId));
					this.adminsInEvent.splice(index, 1);
					this.otherUsersInEvent.push(user);
					this.messageService.showSuccess('Admin removed successfully');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to remove admin');
					console.error('Something went wrong while removing admin from event', err?.error?.message);
				}
			});
		}
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
		this.deleteSubscription?.unsubscribe();
	}
}
