import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
	templateUrl: 'login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: true,
	imports: [
		MatToolbarModule,
		MatCardModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressSpinnerModule,
		NgIf,
		MatButtonModule,
	],
})
export class LoginComponent {
	@ViewChild('usernameField') private usernameField: ElementRef;

	hide = true;
	loading = false;
	resetPasswordView = false;
	resetPasswordRequestSent = false;
	errorResponse: string;

	loginForm = new FormGroup({
		username: new FormControl<string>(''),
		password: new FormControl<string>(''),
	});
	resetPasswordForm = new FormGroup({
		email: new FormControl<string>('', [Validators.required, Validators.email]),
	});

	constructor(private authService: AuthService, private router: Router, private messageService: MessageService) { }

	login() {
		if (this.loginForm.valid) {
			const username = this.loginForm.get<string>('username')?.value;
			const password = this.loginForm.get<string>('password')?.value;
			if (username && password) {
				this.loading = true;
				this.authService.login(username, password).subscribe({
					next: (result) => {
						if (result) {
							this.messageService.showSuccess('Login successful');
							this.router.navigate(['/events']);
						} else {
							this.loading = false;
							this.messageService.showError('Login failed');
							console.error('Could not login');
						}
					},
					error: (error: ApiError) => {
						// User not found
						if (error?.error?.code === 'PUD-003' || error?.error?.code === 'PUD-002') {
							this.messageService.showError('Wrong username or password');
						} else {
							this.messageService.showError('Login failed');
							console.error('Error occurred while logging in', error?.error?.message);
						}
						this.loading = false;
					},
				});
			} else {
				this.usernameField.nativeElement.focus();
			}
		}
	}

	registerUser() {
		this.router.navigate(['/register'], {
			state: { username: this.loginForm.get('username')?.value },
		});
	}

	toggleForgotPassword() {
		if (!this.loading) {
			this.resetPasswordView = !this.resetPasswordView;
		}
	}

	sendResetPasswordEmail() {
		if (!this.resetPasswordForm.valid) {
			return;
		}

		const email = this.resetPasswordForm.get('email')?.value;
		if (email) {
			this.loading = true;
			this.resetPasswordRequestSent = false;
			this.errorResponse = '';
			this.authService
				.sendResetPasswordEmail(email).subscribe({
					next: () => {
						this.loading = false;
						this.resetPasswordRequestSent = true;
					},
					error: (err: ApiError) => {
						this.loading = false;
						if (err.status === 400) {
							this.errorResponse = 'Server not configured for sending email';
						}
						else if (err.status >= 500) {
							this.errorResponse = 'Something went wrong while sending email :(';
						}
					}
				});
		}
	}

	resetText() {
		this.resetPasswordRequestSent = false;
		this.errorResponse = '';
	}
}
