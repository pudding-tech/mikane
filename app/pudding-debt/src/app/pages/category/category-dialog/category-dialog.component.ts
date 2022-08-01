import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'category-dialog',
	templateUrl: 'category-dialog.component.html',
})
export class CategoryDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<CategoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: string
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
