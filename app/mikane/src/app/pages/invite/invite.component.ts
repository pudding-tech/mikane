import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { FormControlPipe } from '../../shared/forms/form-control.pipe';

@Component({
	templateUrl: './invite.component.html',
	styleUrls: ['./invite.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MatFormFieldModule,
		MatCardModule,
		MatSelectModule,
		MenuComponent,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatInputModule,
		RouterModule,
		MatProgressSpinnerModule,
		FormControlPipe,
	],
})
export class InviteComponent implements OnInit, OnDestroy {
	protected inviteForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
	});

	protected inviteFromGuestForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		guestId: new FormControl('', [Validators.required]),
	});

	protected loading = false;
	protected guestLoading = false;
	private guestsSubscription: Subscription;
	private inviteSubscription: Subscription;
	guests: User[] = [];

	constructor(private userService: UserService, private messageService: MessageService, protected breakpointService: BreakpointService) {}

	ngOnInit() {
		this.guestsSubscription = this.userService.loadGuestUsers().subscribe({
			next: (guests) => {
				this.guests = guests;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to load guest users');
				console.error('Something went wrong while loading guest users', err);
			},
		});
	}

	inviteUser(formDirective: FormGroupDirective) {
		if (this.inviteForm.valid) {
			this.loading = true;
			this.inviteSubscription = this.userService.inviteUser(this.inviteForm.get('email').value).subscribe({
				next: () => {
					this.messageService.showSuccess('User invite sent');
					formDirective.resetForm();
					this.inviteForm.reset();
					this.loading = false;
				},
				error: (err: ApiError) => {
					this.loading = false;
					switch (err?.error?.code) {
						case 'PUD-103':
							this.inviteForm.setErrors({ duplicate: true });
							this.messageService.showError('A user with this email already exists');
							break;
						case 'PUD-004':
							this.inviteForm.setErrors({ email: true });
							this.messageService.showError('Invalid email');
							break;
						default:
							this.messageService.showError('Failed to invite user');
							console.error('something went wrong when inviting user', err);
							break;
					}
				},
			});
		}
	}

	inviteUserFromGuest(formDirective: FormGroupDirective) {
		if (this.inviteFromGuestForm.valid) {
			this.guestLoading = true;
			this.inviteSubscription = this.userService
				.inviteUser(this.inviteFromGuestForm.get('email').value, this.inviteFromGuestForm.get('guestId').value)
				.subscribe({
					next: () => {
						this.messageService.showSuccess('User invite sent');
						formDirective.resetForm();
						this.inviteFromGuestForm.reset();
						this.guestLoading = false;
					},
					error: (err: ApiError) => {
						this.guestLoading = false;
						switch (err?.error?.code) {
							case 'PUD-103':
								this.inviteFromGuestForm.setErrors({ duplicate: true });
								this.messageService.showError('A user with this email already exists');
								break;
							case 'PUD-004':
								this.inviteFromGuestForm.setErrors({ email: true });
								this.messageService.showError('Invalid email');
								break;
							case 'PUD-016':
								this.messageService.showError('Guest must be a valid UUID');
								break;
							default:
								this.messageService.showError('Failed to invite user');
								console.error('something went wrong when inviting user', err);
								break;
						}
					},
				});
		}
	}

	ngOnDestroy(): void {
		this.guestsSubscription?.unsubscribe();
		this.inviteSubscription?.unsubscribe();
	}
}
