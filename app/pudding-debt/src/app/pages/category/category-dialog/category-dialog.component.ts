import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'category-dialog',
	templateUrl: 'category-dialog.component.html',
})
export class CategoryDialogComponent {
	weighted = new FormControl(false);
	addCategoryForm = new FormGroup({
		categoryName: new FormControl('', [Validators.required]),
		weighted: new FormControl(false),
	});

	constructor(
		public dialogRef: MatDialogRef<CategoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { name: string; weighted: boolean }
	) {}

	getErrorMessage() {
		return this.addCategoryForm.get('categoryName')?.hasError('required')
			? 'You must enter a value'
			: '';
	}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
