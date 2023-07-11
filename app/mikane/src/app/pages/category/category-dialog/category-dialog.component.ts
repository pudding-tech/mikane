import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { KeyValuePipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CategoryIcon } from 'src/app/types/enums';

@Component({
	selector: 'category-dialog',
	templateUrl: 'category-dialog.component.html',
	styleUrls: ['category-dialog.component.scss'],
	standalone: true,
	imports: [
		MatDialogModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatCheckboxModule,
		MatButtonModule,
		MatIconModule,
		CdkOverlayOrigin,
		CdkConnectedOverlay,
		MatGridListModule,
		KeyValuePipe,
		NgFor,
	],
})
export class CategoryDialogComponent {
	weighted = new FormControl(false);
	isOpen = false;
	categoryIcons = CategoryIcon;
	addCategoryForm = new FormGroup({
		categoryName: new FormControl('', [Validators.required]),
		weighted: new FormControl(false),
		selectedIcon: new FormControl(CategoryIcon.SHOPPING),
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

	iconChange(icon: CategoryIcon) {
		this.addCategoryForm.value.selectedIcon = icon;
		this.isOpen = false;
	}
}
