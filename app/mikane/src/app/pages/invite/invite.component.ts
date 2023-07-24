import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

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
		MenuComponent,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatInputModule,
		RouterModule,
		MatProgressSpinnerModule,
	],
})
export class InviteComponent {
	protected inviteForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
	});

	protected loading = false;

	constructor(private userService: UserService, private messageService: MessageService) {}

	inviteUser(formDirective: FormGroupDirective) {
		if (this.inviteForm.valid) {
			this.loading = true;
			this.userService.inviteUser(this.inviteForm.get('email').value).subscribe({
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
}
