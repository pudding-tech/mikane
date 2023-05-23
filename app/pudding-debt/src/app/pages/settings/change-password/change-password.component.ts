import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
	selector: 'change-password',
	templateUrl: './change-password.component.html',
	styleUrls: ['./change-password.component.scss'],
	standalone: true,
	imports: [MatCardModule, MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
	hide = true;

	private authSub: Subscription;

	changePasswordForm = new FormGroup({
		currentPassword: new FormControl<string>('', [Validators.required]),
		newPassword: new FormControl<string>('', [Validators.required]),
		newPasswordRetype: new FormControl<string>('', [Validators.required]),
	});

	constructor(private authService: AuthService, private messageService: MessageService, private router: Router) {}

	ngOnInit(): void {
		this.changePasswordForm?.addValidators([
			this.createCompareValidator(this.changePasswordForm.get('newPassword'), this.changePasswordForm.get('newPasswordRetype')),
		]);
	}

	submit() {
		if (this.changePasswordForm.valid) {
			this.authSub = this.authService.changePassword(this.changePasswordForm.get<string>('currentPassword')?.value, this.changePasswordForm.get<string>('newPassword')?.value).subscribe({
				next: (user: User) => {
					if (user) {
						this.messageService.showSuccess('Password reset successfully');
					} else {
						this.messageService.showError('Password reset failed');
						console.error('Something went wrong while registering user');
					}
				},
				error: (err) => {
					this.messageService.showError('Failed to reset password');
					console.error('Error occurred while resetting password', err);
				},
			});
		}
	}

	createCompareValidator(controlOne?: AbstractControl, controlTwo?: AbstractControl) {
		return () => {
			if (controlOne?.value !== controlTwo?.value) {
				controlTwo.setErrors({ match_error: 'Passwords do not match' });
				return { match_error: 'Passwords do not match' };
			}
			return null;
		};
	}

	ngOnDestroy(): void {
		this.authSub?.unsubscribe();
	}
}
