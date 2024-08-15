import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
	templateUrl: 'category-edit-dialog.component.html',
	styleUrls: ['category-edit-dialog.component.scss'],
	standalone: true,
	imports: [MatDialogModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class CategoryEditDialogComponent {
	dialogRef = inject<MatDialogRef<CategoryEditDialogComponent>>(MatDialogRef);
	data = inject<{ catId: number; userId: number; weight: number }>(MAT_DIALOG_DATA);

	editCategoryForm = new FormGroup({
		weight: new FormControl(this.data.weight, [Validators.required, Validators.min(1)]),
	});

	onNoClick(): void {
		this.dialogRef.close();
	}
}
