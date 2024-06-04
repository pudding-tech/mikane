import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
	selector: 'app-preferences',
	templateUrl: './preferences.component.html',
	styleUrls: ['./preferences.component.scss'],
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
		MatButtonToggleModule,
		MatProgressSpinnerModule,
	],
	animations: [
    trigger('fadeInOutAnimation', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate(200, style({ opacity: 1 }))
      ]),
      transition('* => void', [
        animate(200, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PreferencesComponent implements OnDestroy {
	@Input() user: User;
	private editPreferencesSubscription: Subscription;
	protected publicEmail: boolean;
	protected publicPhone: boolean;
	protected loadingEmail: boolean;
	protected loadingPhone: boolean;
	protected updatedEmail: boolean;
	protected updatedPhone: boolean;

	constructor(
		private userService: UserService,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.publicEmail = this.user.publicEmail;
		this.publicPhone = this.user.publicPhone;
	}

	editUserPreferences(type: 'email' | 'phone') {
		if (type === 'email') {
			this.loadingEmail = true;
		}
		else if (type === 'phone') {
			this.loadingPhone = true;
		}
		this.editPreferencesSubscription = this.userService
			.editUserPreferences(
				this.user.id,
				type === 'email' ? this.publicEmail : undefined,
				type === 'phone' ? this.publicPhone : undefined
			)
			.subscribe({
				next: (user) => {
					this.user = user;
					if (type === 'email') {
						this.loadingEmail = false;
						this.updatedEmail = true;
						setTimeout(() => {
							this.updatedEmail = false;
						}, 1000);
					}
					else if (type === 'phone') {
						this.loadingPhone = false;
						this.updatedPhone = true;
						setTimeout(() => {
							this.updatedPhone = false;
						}, 1000);
					}
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to change user preferences');
					console.error('something went wrong while changing user preference', err?.error?.message);
					this.loadingEmail = false;
					this.loadingPhone = false;
				},
			});
	}

	ngOnDestroy(): void {
		this.editPreferencesSubscription?.unsubscribe();
	}
}
