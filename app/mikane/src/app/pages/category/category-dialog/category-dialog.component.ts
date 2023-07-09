import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
	selector: 'category-dialog',
	templateUrl: 'category-dialog.component.html',
	styleUrls: ['category-dialog.component.scss'],
	standalone: true,
	imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule],
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
		return this.addCategoryForm.get('categoryName')?.hasError('required') ? 'You must enter a value' : '';
	}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
