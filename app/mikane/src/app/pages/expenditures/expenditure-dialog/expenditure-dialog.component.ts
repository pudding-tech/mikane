import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/validators/form-control.pipe';
import { CategoryIcon } from 'src/app/types/enums';

@Component({
	selector: 'expenditure-dialog',
	templateUrl: 'expenditure-dialog.component.html',
	styleUrls: ['expenditure-dialog.component.scss'],
	standalone: true,
	imports: [
		MatDialogModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatAutocompleteModule,
		NgFor,
		MatOptionModule,
		MatButtonModule,
		AsyncPipe,
		NgIf,
		MatSelectModule,
		FormControlPipe,
		MatIconModule,
	],
})
export class ExpenditureDialogComponent implements OnInit {
	isOpen: boolean = false;
	categoryIcons = CategoryIcon;

	categories: Category[] = [];
	users: User[] = [];
	expense: any = {};

	addExpenseForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		category: new FormControl('', [Validators.required]),
		selectedIcon: new FormControl(CategoryIcon.SHOPPING),
		amount: new FormControl('', [Validators.required]),
		payer: new FormControl(this.data.userId, [Validators.required]),
	});

	constructor(
		public dialogRef: MatDialogRef<ExpenditureDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			eventId: string;
			userId: string;
		},
		private categoryService: CategoryService,
		private userService: UserService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit() {
		this.categoryService.loadCategories(this.data.eventId).subscribe((categories) => {
			this.categories = categories;
		});

		this.userService.loadUsersByEvent(this.data.eventId).subscribe((users) => {
			this.users = users;
		});
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	iconChange(icon: CategoryIcon) {
		this.addExpenseForm.value.selectedIcon = icon;
	}

	findCategory(categoryName: string) {
		return this.categories.find((c) => c.name === categoryName);
	}
}
