import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { emailValidator } from 'src/app/shared/forms/validators/async-email.validator';
import { phoneValidator } from 'src/app/shared/forms/validators/async-phone.validator';
import { usernameValidator } from 'src/app/shared/forms/validators/async-username.validator';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
	],
})
export class UserSettingsComponent implements OnInit, OnDestroy {
	private editSubscription: Subscription;

	@Input() user: User;
	editMode = false;

	editUserForm = new FormGroup({
		username: new FormControl<string>('', [Validators.required]),
		firstName: new FormControl<string>('', [Validators.required]),
		lastName: new FormControl<string>(''),
		email: new FormControl<string>('', [Validators.required, Validators.email]),
		phone: new FormControl<string>('', [Validators.required]),
	});

	constructor(
		private userService: UserService,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService,
		private formValidationService: FormValidationService
	) {}

	ngOnInit(): void {
		this.editUserForm.patchValue(this.user);

		this.editUserForm.get('username').addAsyncValidators(usernameValidator(this.formValidationService, this.user.id));
		this.editUserForm.get('email').addAsyncValidators(emailValidator(this.formValidationService, this.user.id));
		this.editUserForm.get('phone').addAsyncValidators(phoneValidator(this.formValidationService, this.user.id));
	}

	editUser() {
		this.editSubscription = this.userService
			.editUser(
				this.user.id,
				this.editUserForm.get('username').value,
				this.editUserForm.get('firstName').value,
				this.editUserForm.get('lastName').value,
				this.editUserForm.get('email').value,
				this.editUserForm.get('phone').value
			)
			.subscribe({
				next: (user) => {
					this.messageService.showSuccess('User edited');
					this.user = user;
					this.toggleEditMode();
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to edit user');
					console.error('something went wrong while editing user', err?.error?.message);
				},
			});
	}

	cancelEditMode() {
		this.editUserForm.patchValue(this.user);
		this.toggleEditMode();
	}

	toggleEditMode() {
		this.editMode = !this.editMode;
	}

	ngOnDestroy(): void {
		this.editSubscription?.unsubscribe();
	}
}
