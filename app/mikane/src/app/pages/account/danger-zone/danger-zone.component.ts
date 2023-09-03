import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
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
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	selector: 'danger-zone',
	templateUrl: './danger-zone.component.html',
	styleUrls: ['./danger-zone.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
	],
})
export class DangerZoneComponent implements OnDestroy {
	private deleteSubscription: Subscription;
	protected loading: boolean = false;

	@Input('user') currentUser: User;

	constructor(
		private userService: UserService,
		private router: Router,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

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
			?.afterClosed()
			.pipe(
				switchMap((confirm) => {
					if (confirm) {
						this.loading = true;
						return this.userService.requestDeleteAccount();
					} else {
						return NEVER;
					}
				})
			)
			.subscribe({
				next: () => {
					this.loading = false;
					this.messageService.showSuccess('Email sent!');
					this.router.navigate(['/login']);
				},
				error: (err: ApiError) => {
					this.loading = false;
					this.messageService.showError('Failed to send email!');
					console.error('something went wrong while sending account deletion email', err?.error?.message);
				},
			});
	}

	ngOnDestroy(): void {
		this.deleteSubscription?.unsubscribe();
	}
}
