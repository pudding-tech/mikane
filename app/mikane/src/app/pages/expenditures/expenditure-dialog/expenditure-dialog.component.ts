import { AsyncPipe } from '@angular/common';
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
import { Expense } from 'src/app/services/expense/expense.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { CategoryIcon } from 'src/app/types/enums';

@Component({
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
		MatOptionModule,
		MatButtonModule,
		AsyncPipe,
		MatSelectModule,
		FormControlPipe,
		MatIconModule,
	],
})
export class ExpenditureDialogComponent implements OnInit {
	isOpen = false;
	edit = false;
	categoryIcons = CategoryIcon;

	categories: Category[] = [];
	users: User[] = [];

	addExpenseForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		category: new FormControl('', [Validators.required]),
		selectedIcon: new FormControl(CategoryIcon.SHOPPING),
		amount: new FormControl(0, [Validators.required, Validators.min(0)]),
		payer: new FormControl(this.data.userId, [Validators.required]),
	});

	constructor(
		public dialogRef: MatDialogRef<ExpenditureDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			eventId: string;
			userId: string;
			expense?: Expense;
		},
		private categoryService: CategoryService,
		private userService: UserService,
		public breakpointService: BreakpointService,
	) {}

	ngOnInit() {
		this.categoryService.loadCategories(this.data.eventId).subscribe((categories) => {
			this.categories = categories;
		});

		this.userService.loadUsersByEvent(this.data.eventId).subscribe((users) => {
			this.users = users;
		});

		if (this.data.expense) {
			// Expense is being edited
			this.edit = true;
			this.addExpenseForm.get('name').patchValue(this.data.expense.name);
			this.addExpenseForm.get('description').patchValue(this.data.expense.description);
			this.addExpenseForm.get('category').patchValue(this.data.expense.categoryInfo.name);
			this.addExpenseForm.get('selectedIcon').patchValue(this.data.expense.categoryInfo.icon as CategoryIcon);
			this.addExpenseForm.get('amount').patchValue(this.data.expense.amount);
			this.addExpenseForm.get('payer').patchValue(this.data.expense.payer.id);

			this.addExpenseForm.markAsDirty();
		}
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
