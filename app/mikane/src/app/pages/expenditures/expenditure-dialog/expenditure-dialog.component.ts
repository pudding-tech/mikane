import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { Expense } from 'src/app/services/expense/expense.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { CategoryIcon } from 'src/app/types/enums';

@Component({
	templateUrl: 'expenditure-dialog.component.html',
	styleUrls: ['expenditure-dialog.component.scss'],
	standalone: true,
	providers: [provideNativeDateAdapter()],
	imports: [
		MatDialogModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatDatepickerModule,
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
	dialogRef = inject<MatDialogRef<ExpenditureDialogComponent>>(MatDialogRef);
	data = inject<{
		eventId: string;
		userId: string;
		expense?: Expense;
	}>(MAT_DIALOG_DATA);
	private categoryService = inject(CategoryService);
	private userService = inject(UserService);
	contextService = inject(ContextService);

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
		payerId: new FormControl(this.data.userId, [Validators.required]),
		expenseDate: new FormControl(null),
	});

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
			this.addExpenseForm.get('payerId').patchValue(this.data.expense.payer.id);
			this.addExpenseForm.get('expenseDate').patchValue(this.data.expense.expenseDate);

			this.addExpenseForm.markAsDirty();
		}
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	findCategory(categoryName: string) {
		return this.categories.find((c) => c.name === categoryName);
	}

	clearDate(event: MouseEvent) {
		this.addExpenseForm.get('expenseDate').patchValue(null);
		event.stopPropagation();
	}
}
