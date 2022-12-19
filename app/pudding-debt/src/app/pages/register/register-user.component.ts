import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';

@Component({
	templateUrl: './register-user.component.html',
	styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent {
	hide = true;

	registerUserForm = new FormGroup({
		email: new FormControl<string>('', [Validators.required]),
		password: new FormControl<string>('', [Validators.required]),
		passwordRetype: new FormControl<string>('', [Validators.required]),
	});

	constructor(
		private userService: UserService,
		private messageService: MessageService,
		private router: Router
	) {}

	register() {
		if (this.registerUserForm.valid) {
			this.userService
				.registerUser(
					this.registerUserForm.get<string>('email')?.value,
					this.registerUserForm.get<string>('password')?.value
				)
				.subscribe({
					next: (user: User) => {
						if (user) {
							this.messageService.showSuccess(
								'Registered successfully'
							);
							this.router.navigate(['/events']);
						} else {
							this.messageService.showError('Failed to register');
							console.error(
								'Something went wrong while registering user'
							);
						}
					},
					error: (err) => {
						this.messageService.showError('Failed to register');
						console.error(
							'Error occurred while registering user',
							err
						);
					},
				});
		}
	}
}
