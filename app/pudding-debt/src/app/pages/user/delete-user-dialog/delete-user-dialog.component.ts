import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	templateUrl: './delete-user-dialog.component.html',
})
export class DeleteUserDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: number
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
