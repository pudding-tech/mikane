import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { NEVER, Subscription, switchMap } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	selector: 'danger-zone',
	templateUrl: './danger-zone.component.html',
	styleUrls: ['./danger-zone.component.scss'],
	standalone: true,
	imports: [CommonModule, MatCardModule, MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class DangerZoneComponent implements OnInit, OnDestroy {
	private subscription: Subscription;
	private deleteSubscription: Subscription;

	currentUser: User;

	constructor(
		private userService: UserService,
		private authService: AuthService,
		private router: Router,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.subscription = this.authService
			.getCurrentUser()
			.pipe(
				switchMap((user) => {
					return this.userService.loadUserById(user?.id);
				})
			)
			.subscribe({
				next: (user) => {
					this.currentUser = user;
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to get user');
					console.error('something went wrong getting user on user setting page: ' + err?.error?.message);
				},
			});
	}

	deleteUser() {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '400px',
			data: {
				title: 'Send delete account email',
				content: 'Are you sure you want to send the delete account email?',
				confirm: 'Yes, I am sure',
			},
			autoFocus: false,
		});

		this.deleteSubscription = dialogRef
			.afterClosed()
			.pipe(
				switchMap((confirm) => {
					if (confirm) {
						return this.userService.deleteUser(this.currentUser.id);
					} else {
						return NEVER;
					}
				})
			)
			.subscribe({
				next: () => {
					this.messageService.showSuccess('User deleted successfully');
					this.router.navigate(['/login']);
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to delete user');
					console.error('something went wrong while deleting user', err?.error?.message);
				},
			});
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
		this.deleteSubscription?.unsubscribe();
	}
}
