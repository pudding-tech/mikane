import { NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
	selector: 'category-edit-dialog',
	templateUrl: 'category-edit-dialog.component.html',
	styleUrls: ['category-edit-dialog.component.scss'],
	standalone: true,
	imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
})
export class CategoryEditDialogComponent {
	editCategoryForm = new FormGroup({
		weight: new FormControl(this.data.weight, [Validators.required, Validators.min(1)]),
	});

	constructor(
		public dialogRef: MatDialogRef<CategoryEditDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { catId: number; userId: number; weight: number }
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
