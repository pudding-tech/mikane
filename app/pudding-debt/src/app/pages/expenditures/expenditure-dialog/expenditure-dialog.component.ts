import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { Expense } from 'src/app/services/expense/expense.service';
import { User, UserService } from 'src/app/services/user/user.service';

@Component({
	selector: 'expenditure-dialog',
	templateUrl: 'expenditure-dialog.component.html',
})
export class ExpenditureDialogComponent implements OnInit {
    categories: Category[] = [];
    users: User[] = [];
    expense: any = {};
    
	constructor(
		public dialogRef: MatDialogRef<ExpenditureDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: number,
        private categoryService: CategoryService,
        private userService: UserService,
	) {}

    ngOnInit() {
        this.categoryService.loadCategories(this.data).subscribe((categories) => {
            this.categories = categories;
        });

        this.userService.loadUsersForEvent(this.data).subscribe((users) => {
            this.users = users;
        });
    }

	onNoClick(): void {
		this.dialogRef.close();
	}

    onSave() {
        this.dialogRef.close(this.expense);
    }
}
