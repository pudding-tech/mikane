import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { KeyValidationService } from 'src/app/services/key-validation/key-validation.service';
import { MessageService } from 'src/app/services/message/message.service';
import { createCompareValidator } from 'src/app/shared/forms/validators/compare.validator';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatToolbarModule,
		MatCardModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
	],
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
	protected hide = true;

	private passSub: Subscription;
	private authSub: Subscription;

	protected resetKey: string;

	resetPasswordForm = new FormGroup({
		newPassword: new FormControl<string>('', [Validators.required]),
		newPasswordRetype: new FormControl<string>('', [Validators.required]),
	});

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService,
		private keyValidationService: KeyValidationService,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.resetPasswordForm?.addValidators([
			createCompareValidator(this.resetPasswordForm.get('newPassword'), this.resetPasswordForm.get('newPasswordRetype')),
		]);

		const key = this.route.snapshot.paramMap.get('key');
		this.authSub = this.keyValidationService.verifyPasswordReset(key).subscribe({
			next: () => {
				this.resetKey = key;
			},
			error: (err: ApiError) => {
				if (err.status === 404) {
					this.messageService.showError('Invalid key');
					this.router.navigate(['/login']);
				} else {
					this.messageService.showError('Failed to verify key');
					console.error('Something went wrong when verifying password reset key', err?.error);
				}
			},
		});
	}

	submit() {
		if (this.resetPasswordForm.valid) {
			this.passSub = this.authService
				.resetPassword(this.resetKey, this.resetPasswordForm.get<string>('newPassword')?.value)
				.subscribe({
					next: () => {
						this.messageService.showSuccess('Password changed successfully');
						this.router.navigate(['/login']);
					},
					error: (err: ApiError) => {
						this.messageService.showError('Failed to change password');
						console.error('Something went wrong when changing password on password reset page', err?.error);
					},
				});
		}
	}

	ngOnDestroy(): void {
		this.passSub?.unsubscribe();
		this.authSub?.unsubscribe();
	}
}
