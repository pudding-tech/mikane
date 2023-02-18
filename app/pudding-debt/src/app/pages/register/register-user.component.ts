import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { Phonenumber } from 'src/app/types/phonenumber.type';

@Component({
	templateUrl: './register-user.component.html',
	styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent implements OnInit, AfterViewInit, OnDestroy {
	hide = true;

	private userSub: Subscription;

	private phonenumber!: Phonenumber;
	private phoneCtrl$: Subscription | undefined;

	registerUserForm = new FormGroup({
		username: new FormControl<string>('', [Validators.required]),
		firstName: new FormControl<string>('', [Validators.required]),
		lastName: new FormControl<string>('', [Validators.required]),
		email: new FormControl<string>('', [Validators.required, Validators.email]),
		phonenumber: new FormControl<string>('', [Validators.required]),
		passwordGroup: new FormGroup({
			password: new FormControl<string>('', [Validators.required]),
			passwordRetype: new FormControl<string>('', [Validators.required]),
		}),
	});

	constructor(private userService: UserService, private messageService: MessageService, private router: Router) {}

	ngOnInit() {
		if (window.history.state?.username) {
			this.registerUserForm.get('username')?.setValue(window.history.state?.email);
		}

		let passwordGroup = this.registerUserForm.get('passwordGroup');
		this.registerUserForm
			.get('passwordGroup')
			?.addValidators([this.createCompareValidator(passwordGroup.get('password'), passwordGroup.get('passwordRetype'))]);
	}

	ngAfterViewInit(): void {
		this.phoneCtrl$ = this.registerUserForm.get('phonenumber')?.valueChanges.subscribe((number) => {
			// TODO: Phonenumber validation
			this.phonenumber = {
				number: number ? number : '',
			};
		});
	}

	register() {
		if (this.registerUserForm.valid) {
			this.userSub = this.userService
				.registerUser(
					this.registerUserForm.get<string>('username')?.value,
					this.registerUserForm.get<string>('firstName')?.value,
					this.registerUserForm.get<string>('lastName')?.value,
					this.registerUserForm.get<string>('email')?.value,
					this.phonenumber,
					this.registerUserForm.get<string>('password')?.value
				)
				.subscribe({
					next: (user: User) => {
						if (user) {
							this.messageService.showSuccess('Registered successfully');
							this.router.navigate(['/login']);
						} else {
							this.messageService.showError('Failed to register');
							console.error('Something went wrong while registering user');
						}
					},
					error: (err) => {
						this.messageService.showError('Failed to register');
						console.error('Error occurred while registering user', err);
					},
				});
		}
	}

	ngOnDestroy(): void {
		this.phoneCtrl$?.unsubscribe();
		this.userSub?.unsubscribe();
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
}
