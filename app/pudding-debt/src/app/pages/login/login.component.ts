import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
		NgIf,
		MatButtonModule,
	],
})
export class LoginComponent {
	hide = true;

	loginForm = new FormGroup({
		username: new FormControl<string>('', [Validators.required]),
		password: new FormControl<string>('', [Validators.required]),
	});

	constructor(private authService: AuthService, private router: Router, private messageService: MessageService) {}

	login() {
		if (this.loginForm.valid) {
			this.authService.login(this.loginForm.get<string>('username')?.value, this.loginForm.get<string>('password')?.value).subscribe({
				next: (result) => {
					if (result) {
						this.messageService.showSuccess('Login successful');
						this.router.navigate(['/events']);
					} else {
						this.messageService.showError('Login failed');
						console.error('Could not login');
					}
				},
				error: (error: ApiError) => {
					// User not found
					if (error?.error?.code === 'PUD-003') {
						this.messageService.showError('Wrong username or password');
					} else {
						this.messageService.showError('Login failed');
						console.error('Error occurred while logging in', error?.error?.message);
					}
				},
			});
		}
	}

	registerUser() {
		this.router.navigate(['/register'], {
			state: { username: this.loginForm.get('username')?.value },
		});
	}
}
