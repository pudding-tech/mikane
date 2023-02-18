import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';

@Component({
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
})
export class ForgotPasswordComponent implements OnDestroy {
	hide = true;

	private authSub: Subscription;

	resetPasswordForm = new FormGroup({
		password: new FormControl<string>('', [Validators.required]),
	});

	constructor(private authService: AuthService, private messageService: MessageService) {}

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

	ngOnDestroy(): void {
		this.authSub?.unsubscribe();
	}
}
