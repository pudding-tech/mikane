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
	selector: 'reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
	standalone: true,
	imports: [MatCardModule, MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
	hide = true;

	private authSub: Subscription;

	resetPasswordForm = new FormGroup({
		password: new FormControl<string>('', [Validators.required]),
		passwordRetype: new FormControl<string>('', [Validators.required]),
	});

	constructor(private authService: AuthService, private messageService: MessageService, private router: Router) {}

	ngOnInit(): void {
		this.resetPasswordForm?.addValidators([
			this.createCompareValidator(this.resetPasswordForm.get('password'), this.resetPasswordForm.get('passwordRetype')),
		]);
	}

	submit() {
		if (this.resetPasswordForm.valid) {
			this.authSub = this.authService.resetPassword(this.resetPasswordForm.get<string>('password')?.value).subscribe({
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
