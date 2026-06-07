import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BreakpointService } from '../../../services/breakpoint/breakpoint.service';
import { LogService } from '../../../services/log/log.service';
import { MessageService } from '../../../services/message/message.service';
import { User, UserService } from '../../../services/user/user.service';
import { ApiError } from '../../../types/apiError.type';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.scss'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [
		MatCardModule,
		MatIconModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatSlideToggleModule,
		AsyncPipe,
		NgTemplateOutlet,
	],
})
export class PreferencesComponent implements OnInit, OnDestroy {
	private userService = inject(UserService);
	private messageService = inject(MessageService);
	breakpointService = inject(BreakpointService);
	private logService = inject(LogService);

	user = model<User>();
	private editPreferencesSubscription = new Subscription();
	protected publicEmail: boolean;
	protected publicPhone: boolean;
	protected updatedEmail: boolean;
	protected updatedPhone: boolean;
	protected loadingEmail = new BehaviorSubject<boolean>(false);
	protected loadingPhone = new BehaviorSubject<boolean>(false);

	ngOnInit(): void {
		this.publicEmail = this.user().publicEmail;
		this.publicPhone = this.user().publicPhone;
	}

	toggleEmail() {
		this.loadingEmail.next(true);
		this.editPreferencesSubscription.add(
			this.userService.editUserPreferences(this.user().id, this.publicEmail, undefined).subscribe({
				next: (user) => {
					this.user.set(user);
					this.loadingEmail.next(false);
				},
				error: (err: ApiError) => {
					this.publicEmail = !this.publicEmail;
					this.messageService.showError('Failed to change user preferences');
					this.logService.error('something went wrong while changing user email preference: ' + err?.error?.message);
					this.loadingEmail.next(false);
				},
			}),
		);
	}

	togglePhone() {
		this.loadingPhone.next(true);
		this.editPreferencesSubscription.add(
			this.userService.editUserPreferences(this.user().id, undefined, this.publicPhone).subscribe({
				next: (user) => {
					this.user.set(user);
					this.loadingPhone.next(false);
				},
				error: (err: ApiError) => {
					this.publicPhone = !this.publicPhone;
					this.messageService.showError('Failed to change user preferences');
					this.logService.error('something went wrong while changing user phone preference: ' + err?.error?.message);
					this.loadingPhone.next(false);
				},
			}),
		);
	}

	ngOnDestroy(): void {
		this.editPreferencesSubscription?.unsubscribe();
	}
}
