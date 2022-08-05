import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'delete-category-dialog',
	templateUrl: 'category-delete-dialog.component.html',
})
export class DeleteCategoryDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<DeleteCategoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: number
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}