import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { categoryNameValidator } from 'src/app/shared/forms/validators/async-category-name.validator';
import { CategoryIcon } from 'src/app/types/enums';

@Component({
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
		NgIf,
	],
})
export class CategoryDialogComponent implements OnInit {
	weighted = new FormControl(false);
	isOpen = false;
	categoryIcons = CategoryIcon;
	addCategoryForm = new FormGroup({
		categoryName: new FormControl(
			'',
			[Validators.required],
			categoryNameValidator(this.formValidationService, this.data.eventId, this.data.categoryId ?? undefined)
		),
		weighted: new FormControl(false),
		selectedIcon: new FormControl(CategoryIcon.SHOPPING),
	});

	constructor(
		public dialogRef: MatDialogRef<CategoryDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: { name: string; weighted: boolean; eventId: string; categoryId: string; icon: CategoryIcon },
		private formValidationService: FormValidationService
	) {}

	ngOnInit(): void {
		if (this.data.name) {
			// Category is being edited
			this.addCategoryForm.get('categoryName').patchValue(this.data.name);
			if (this.data.icon) {
				this.addCategoryForm.get('selectedIcon').patchValue(this.data.icon);
			}
			this.addCategoryForm.markAsDirty();
		}
	}

	getErrorMessage() {
		return this.addCategoryForm.get('categoryName')?.hasError('required') ? 'You must enter a value' : '';
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	iconChange(icon: CategoryIcon) {
		this.addCategoryForm.get('selectedIcon').patchValue(icon);
		this.isOpen = false;
	}
}
