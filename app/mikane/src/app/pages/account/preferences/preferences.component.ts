import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.scss'],
	standalone: true,
	imports: [CommonModule, MatCardModule, MatIconModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSlideToggleModule],
})
export class PreferencesComponent implements OnInit, OnDestroy {
	@Input() user: User;
	private editPreferencesSubscription = new Subscription();
	protected publicEmail: boolean;
	protected publicPhone: boolean;
	protected loadingEmail: boolean;
	protected loadingPhone: boolean;
	protected updatedEmail: boolean;
	protected updatedPhone: boolean;

	constructor(
		private userService: UserService,
		private messageService: MessageService,
		public breakpointService: BreakpointService,
	) {}

	ngOnInit(): void {
		this.publicEmail = this.user.publicEmail;
		this.publicPhone = this.user.publicPhone;
	}

	toggleEmail() {
		this.loadingEmail = true;
		this.editPreferencesSubscription.add(
			this.userService.editUserPreferences(this.user.id, this.publicEmail, undefined).subscribe({
				next: (user) => {
					this.user = user;
					this.loadingEmail = false;
				},
				error: (err: ApiError) => {
					this.publicEmail = !this.publicEmail;
					this.messageService.showError('Failed to change user preferences');
					console.error('something went wrong while changing user email preference', err?.error?.message);
					this.loadingEmail = false;
				},
			}),
		);
	}

	togglePhone() {
		this.loadingPhone = true;
		this.editPreferencesSubscription.add(
			this.userService.editUserPreferences(this.user.id, undefined, this.publicPhone).subscribe({
				next: (user) => {
					this.user = user;
					this.loadingPhone = false;
				},
				error: (err: ApiError) => {
					this.publicPhone = !this.publicPhone;
					this.messageService.showError('Failed to change user preferences');
					console.error('something went wrong while changing user phone preference', err?.error?.message);
					this.loadingPhone = false;
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.editPreferencesSubscription?.unsubscribe();
	}
}
