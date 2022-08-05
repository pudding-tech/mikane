import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'user-dialog',
	templateUrl: './user-dialog.component.html',
})
export class UserDialogComponent {
    newUser = { name: '' };

    addUserForm = new FormGroup({
        name: new FormControl('', [Validators.required]),
    });

	constructor(
		public dialogRef: MatDialogRef<UserDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
