import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { createCompareValidator } from 'src/app/shared/forms/validators/compare.validator';

@Component({
	selector: 'app-change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
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
export class ChangePasswordComponent implements OnInit, OnDestroy {
	hide = true;

	private userSub: Subscription;

	changePasswordForm = new FormGroup({
		currentPassword: new FormControl<string>('', [Validators.required]),
		newPassword: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
		newPasswordRetype: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
	});

	constructor(
		private userService: UserService,
		private messageService: MessageService,
		private router: Router,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.changePasswordForm?.addValidators([
			createCompareValidator(this.changePasswordForm.get('newPassword'), this.changePasswordForm.get('newPasswordRetype')),
		]);
	}

	submit() {
		if (this.changePasswordForm.valid) {
			this.userSub = this.userService
				.changeUserPassword(
					this.changePasswordForm.get<string>('currentPassword')?.value,
					this.changePasswordForm.get<string>('newPassword')?.value
				)
				.subscribe({
					next: (user: User) => {
						if (user) {
							this.messageService.showSuccess('Password changed successfully. You will need to log in again.');
							this.router.navigate(['/login']);
						} else {
							this.messageService.showError('Failed to change password');
							console.error('Something went wrong while getting user');
						}
					},
					error: (err) => {
						this.messageService.showError('Failed to change password');
						console.error('Error occurred while changing password', err?.error);
					},
				});
		}
	}

	ngOnDestroy(): void {
		this.userSub?.unsubscribe();
	}
}
