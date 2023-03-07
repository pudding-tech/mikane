import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
	selector: 'category-edit-dialog',
	templateUrl: 'category-edit-dialog.component.html',
	standalone: true,
	imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class CategoryEditDialogComponent {
	editCategoryForm = new FormGroup({
		weight: new FormControl('', [Validators.required]),
	});

	constructor(
		public dialogRef: MatDialogRef<CategoryEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { catId: number; userId: number }
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
