import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
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
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	selector: 'app-danger-zone',
	templateUrl: './danger-zone.component.html',
	styleUrls: ['./danger-zone.component.scss'],
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
	private userService = inject(UserService);
	private router = inject(Router);
	dialog = inject(MatDialog);
	private messageService = inject(MessageService);
	breakpointService = inject(BreakpointService);
	private logService = inject(LogService);

	private deleteSubscription: Subscription;
	protected loading = false;

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
				}),
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
					this.logService.error('something went wrong while sending account deletion email: ' + err?.error?.message);
				},
			});
	}

	ngOnDestroy(): void {
		this.deleteSubscription?.unsubscribe();
	}
}
