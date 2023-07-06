import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

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
	],
})
export class ExpenditureDialogComponent implements OnInit {
	categories: Category[] = [];
	users: User[] = [];
	expense: any = {};

	addExpenseForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		category: new FormControl('', [Validators.required]),
		amount: new FormControl('', [Validators.required]),
		payer: new FormControl({ value: this.data.userId, disabled: this.data.userId !== undefined }, [Validators.required]),
	});

	constructor(
		public dialogRef: MatDialogRef<ExpenditureDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public data: {
			eventId: string;
			userId: string;
		},
		private categoryService: CategoryService,
		private userService: UserService
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
}
