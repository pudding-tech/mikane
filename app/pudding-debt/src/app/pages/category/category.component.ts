import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	Category,
	CategoryService,
} from 'src/app/services/category/category.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { map } from 'lodash';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
	private eventId!: number;

	categories: Category[] = [];
	users: User[] = [];
	displayedColumns: string[] = ['name', 'weight', 'save'];

	name = new FormControl('');
	weight = new FormControl();

	constructor(
		private categoryService: CategoryService,
		private userService: UserService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
        private cd: ChangeDetectorRef,
	) {}

	ngOnInit(): void {
		this.route.parent?.params.subscribe((params) => {
			console.log('route params', params);
			this.eventId = params['eventId'];
			this.loadCategories();
		});
	}

	loadCategories() {
		this.categoryService
			.loadCategories(this.eventId)
			.subscribe((categories) => {
				this.categories = categories;
				this.loadUsers();
			});
	}

	loadUsers() {
		this.userService.loadUsersForEvent(this.eventId).subscribe((users) => {
			this.users = users;
		});
	}

	filterUsers(categoryId: number) {
		const category = this.categories.find((category) => {
			return category.id === categoryId;
		});

		return this.users.filter((user) => {
			return (
				map(category?.users, (user) => {
					return user.id;
				}).indexOf(user.id) < 0
			);
		});
	}

	openDialog() {
		const dialogRef = this.dialog.open(CategoryDialogComponent, {
			width: '350px',
		});

		dialogRef.afterClosed().subscribe((result) => {
			console.log('The dialog was closed');
			if (result) {
				this.createCategory(result);
			}
		});
	}

	createCategory(name: string) {
		this.categoryService
			.createCategory(name, this.eventId)
			.subscribe((category) => {
				this.categories.push(category);
			});
	}

	addUser(categoryId: number) {
		console.log(this.name.value);
		if (this.name.value) {
			this.categoryService
				.addUser(categoryId, +this.name.value, this.weight.value)
				.subscribe((res) => {
					const index = this.categories.findIndex(
						(category) => category.id === res.id
					);
					if (index > -1) {
                        this.categories[index].users = res.users;
                        this.cd.detectChanges();
					}
                    this.name.setValue('');
					this.name.markAsUntouched();
					this.weight.reset();
				});
		}
	}

	removeUser(categoryId: number, userId: number) {
		this.categoryService.deleteUser(categoryId, userId).subscribe((res) => {
			const index = this.categories.findIndex(
				(category) => category.id === res.id
			);
			if (index > -1) {
				this.categories[index].users = res.users;
                this.cd.detectChanges();
			}
		});
	}

	drop(event: CdkDragDrop<Category[]>) {
		moveItemInArray(
			this.categories,
			event.previousIndex,
			event.currentIndex
		);
	}
}
