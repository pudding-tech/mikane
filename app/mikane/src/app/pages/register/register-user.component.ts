import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { emailValidator } from 'src/app/shared/forms/validators/async-email.validator';
import { phoneValidator } from 'src/app/shared/forms/validators/async-phone.validator';
import { usernameValidator } from 'src/app/shared/forms/validators/async-username.validator';
import { ApiError } from 'src/app/types/apiError.type';
import { Phonenumber } from 'src/app/types/phonenumber.type';

@Component({
	templateUrl: './register-user.component.html',
	styleUrls: ['./register-user.component.scss'],
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
export class RegisterUserComponent implements OnInit, AfterViewInit, OnDestroy {
	hide = true;

	private userSub: Subscription;
	protected guestRegistration = false;

	private phone!: Phonenumber;
	private phoneCtrl$: Subscription | undefined;

	protected key: string;
	protected loading = false;

	registerUserForm = new FormGroup({
		username: new FormControl<string>('', [Validators.required], [usernameValidator(this.formValidationService)]),
		firstName: new FormControl<string>('', [Validators.required]),
		lastName: new FormControl<string>(''),
		email: new FormControl<string>('', [Validators.required, Validators.email], [emailValidator(this.formValidationService)]),
		phone: new FormControl<string>('', [Validators.required], [phoneValidator(this.formValidationService)]),
		passwordGroup: new FormGroup({
			password: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
			passwordRetype: new FormControl<string>('', [Validators.required, Validators.minLength(3)]),
		}),
	});

	constructor(
		private userService: UserService,
		private messageService: MessageService,
		private router: Router,
		private route: ActivatedRoute,
		private formValidationService: FormValidationService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit() {
		this.route.data.subscribe(({ res }) => {
			this.key = res.key;
			this.registerUserForm.get('email').patchValue(res.user.email);

			// Prefill guest user info
			if (res.user?.firstName) {
				this.guestRegistration = true;
				this.registerUserForm.get('firstName').patchValue(res.user.firstName);
			}
			if (res.user?.lastName) {
				this.guestRegistration = true;
				this.registerUserForm.get('lastName').patchValue(res.user.lastName);
			}
		});

		if (window.history.state?.username) {
			this.registerUserForm.get('username')?.setValue(window.history.state?.email);
		}

		const passwordGroup = this.registerUserForm.get('passwordGroup');
		this.registerUserForm
			.get('passwordGroup')
			?.addValidators([this.createCompareValidator(passwordGroup.get('password'), passwordGroup.get('passwordRetype'))]);
	}

	ngAfterViewInit(): void {
		this.phoneCtrl$ = this.registerUserForm.get('phone')?.valueChanges.subscribe((number) => {
			// TODO: Phonenumber validation
			this.phone = {
				number: number ? number : '',
			};
		});
	}

	register() {
		if (this.registerUserForm.valid) {
			this.loading = true;
			this.userSub = this.userService
				.registerUser(
					this.registerUserForm.get<string>('username')?.value,
					this.registerUserForm.get<string>('firstName')?.value,
					this.registerUserForm.get<string>('lastName')?.value,
					this.registerUserForm.get<string>('email')?.value,
					this.phone,
					this.registerUserForm.get('passwordGroup').get<string>('password')?.value,
					this.key
				)
				.subscribe({
					next: (user: User) => {
						this.loading = false;
						if (user) {
							this.messageService.showSuccess('Registered successfully. You can now log in');
							this.router.navigate(['/login']);
						} else {
							this.messageService.showError('Failed to register');
							console.error('Something went wrong while registering user');
						}
					},
					error: (err: ApiError) => {
						this.loading = false;
						switch (err.error.code) {
							case 'PUD-004':
								this.messageService.showError('Failed to register - Email invalid');
								this.registerUserForm.get('email').setErrors({ invalid: true });
								break;
							case 'PUD-017':
								this.messageService.showError('Username already taken');
								this.registerUserForm.get('username').setErrors({ duplicate: true });
								break;
							case 'PUD-018':
								this.messageService.showError('Email address already taken');
								this.registerUserForm.get('email').setErrors({ duplicate: true });
								break;
							case 'PUD-019':
								this.messageService.showError('Phonenumber already taken');
								this.registerUserForm.get('phone').setErrors({ duplicate: true });
								break;
							case 'PUD-132':
								this.messageService.showError('Can only contain letters, numbers, hyphens, and underscores. Must be between 3-40 characters. Username cannot begin or end with hyphen/underscore.');
								this.registerUserForm.get('username').setErrors({ invalid: true });
								break;
							default:
								this.messageService.showError('Failed to register');
								break;
						}
						console.error('Error occurred while registering user: ', err.error.message);
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
