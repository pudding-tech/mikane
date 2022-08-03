import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'category-edit-dialog',
	templateUrl: 'category-edit-dialog.component.html',
})
export class CategoryEditDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<CategoryEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: {catId: number, userId: number}
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
