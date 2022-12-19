import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
	templateUrl: 'login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	hide = true;

	loginForm = new FormGroup({
		email: new FormControl<string>('', [Validators.required]),
		password: new FormControl<string>('', [Validators.required]),
	});

	constructor(
		private authService: AuthService,
		private router: Router,
		private messageService: MessageService
	) {}

	login() {
		if (this.loginForm.valid) {
			this.authService
				.login(
					this.loginForm.get<string>('email')?.value,
					this.loginForm.get<string>('password')?.value
				)
				.subscribe({
					next: (result) => {
						if (result) {
							this.messageService.showSuccess('Login successful');
							this.router.navigate(['/events']);
						} else {
							this.messageService.showError('Login failed');
							console.error('Could not login');
						}
					},
					error: (error) => {
						this.messageService.showError('Login failed');
						console.error('Error occurred while logging in', error);
					},
				});
		}
	}

	registerUser() {
		this.router.navigate(['/register']);
	}
}
