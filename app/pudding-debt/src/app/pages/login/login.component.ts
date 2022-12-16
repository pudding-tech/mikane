import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
	templateUrl: 'login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	loginForm = new FormGroup({
		username: new FormControl<string>('', [Validators.required]),
		password: new FormControl<string>('', [Validators.required]),
	});

    loginError = false;

	constructor(private authService: AuthService, private router: Router) {}

	login() {
		if (this.loginForm.valid) {
			this.authService
				.login(
					this.loginForm.get<string>('username')?.value,
					this.loginForm.get<string>('password')?.value
				)
				.subscribe({
					next: (result) => {
						if (result) {
							this.router.navigate(['/events']);
						} else {
							console.error('Could not login');
						}
					},
					error: (error) => {
						console.error('Error occurred while logging in', error);
					},
				});
		}
	}
}
