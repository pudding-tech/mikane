import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { MessageService } from 'src/app/services/message/message.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { Phonenumber } from 'src/app/types/phonenumber.type';

@Component({
	selector: 'user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.scss'],
	standalone: true,
	imports: [CommonModule, MatCardModule, MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class UserSettingsComponent implements OnInit, OnDestroy {
	private subscription: Subscription;
	private editSubscription: Subscription;

	private phone!: Phonenumber;
	// private phoneCtrl$: Subscription | undefined;

	currentUser: User;
	editMode: boolean = false;

	editUserForm = new FormGroup({
		username: new FormControl<string>('', [Validators.required]),
		firstName: new FormControl<string>('', [Validators.required]),
		lastName: new FormControl<string>(''),
		email: new FormControl<string>('', [Validators.required, Validators.email]),
		phone: new FormControl<string>('', [Validators.required]),
	});

	constructor(
		private userService: UserService,
		private authService: AuthService,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.subscription = this.authService
			.getCurrentUser()
			.pipe(
				switchMap((user) => {
					return this.userService.loadUserById(user?.id);
				})
			)
			.subscribe({
				next: (user) => {
					this.currentUser = user;
					this.editUserForm.patchValue(user);
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to get user');
					console.error('something went wrong getting user on user setting page: ' + err?.error?.message);
				},
			});
	}

	ngAfterViewInit(): void {
		/* 		this.phoneCtrl$ = this.editUserForm.get('phone')?.valueChanges.subscribe((number) => {
			// TODO: Phonenumber validation
			this.phone = {
				number: number ? number : '',
			};
		}); */
	}

	editUser() {
		this.editSubscription = this.userService
			.editUser(
				this.currentUser.id,
				this.editUserForm.get('username').value,
				this.editUserForm.get('firstName').value,
				this.editUserForm.get('lastName').value,
				this.editUserForm.get('email').value,
				this.phone
			)
			.subscribe({
				next: (user) => {
					this.messageService.showSuccess('User edited');
					this.currentUser = user;
					this.toggleEditMode();
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to edit user');
					console.error('something went wrong while editing user', err?.error?.message);
				},
			});
	}

	toggleEditMode() {
		this.editMode = !this.editMode;
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
		this.editSubscription?.unsubscribe();
	}
}
