import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from 'src/app/services/user/user.service';
import { EventNameValidatorDirective } from 'src/app/shared/forms/validators/async-event-name.validator';

@Component({
	templateUrl: 'guest-dialog.component.html',
	styleUrls: ['guest-dialog.component.scss'],
	standalone: true,
	imports: [
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatButtonModule,
		EventNameValidatorDirective,
		MatProgressSpinnerModule,
	],
})
export class GuestDialogComponent {
	dialogRef = inject<MatDialogRef<GuestDialogComponent>>(MatDialogRef);
	data = inject<{ edit: boolean; guest: User }>(MAT_DIALOG_DATA);

	guest: { id?: string; firstName: string; lastName: string } = { firstName: '', lastName: '' };
	edit: boolean;
	currentFirstName: string;
	currentLastName: string;
	delete = false;

	constructor() {
		const data = this.data;

		if (data?.guest) {
			this.guest.firstName = data.guest.firstName;
			this.guest.lastName = data.guest.lastName;
			this.guest.id = data.guest.id;
			this.currentFirstName = data.guest.firstName;
			this.currentLastName = data.guest.lastName;
		}
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSave() {
		this.dialogRef.close({ guest: this.guest });
	}

	deleteGuest() {
		this.dialogRef.close({ guest: this.guest, delete: true });
	}

	openDelete() {
		this.delete = true;
	}

	goBack() {
		this.delete = false;
	}

	isChanged() {
		return this.guest.firstName !== this.currentFirstName || this.guest.lastName !== this.currentLastName;
	}
}
