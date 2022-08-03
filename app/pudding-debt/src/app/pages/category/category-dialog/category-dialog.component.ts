import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'category-dialog',
	templateUrl: 'category-dialog.component.html',
})
export class CategoryDialogComponent {
    weighted = new FormControl(false);

	constructor(
		public dialogRef: MatDialogRef<CategoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { name: string, weighted: boolean }
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
