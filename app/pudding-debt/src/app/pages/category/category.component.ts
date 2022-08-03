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
import { MessageService } from 'src/app/services/message/message.service';
import { CategoryEditDialogComponent } from './category-edit-dialog/category-edit-dialog.component';

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
		private messageService: MessageService
	) {}

	ngOnInit(): void {
		this.route.parent?.params.subscribe((params) => {
			console.log('route params', params);
			this.eventId = params['eventId'];
			this.loadCategories();
		});
	}

	loadCategories() {
		this.categoryService.loadCategories(this.eventId).subscribe({
			next: (categories) => {
				this.categories = categories;
				this.loadUsers();
			},
			error: () => {
				this.messageService.showError('Error loading categories');
			},
		});
	}

	loadUsers() {
		this.userService.loadUsers(this.eventId).subscribe({
			next: (users) => {
				this.users = users;
			},
			error: () => {
				this.messageService.showError('Error loading users');
			},
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
			data: { weighted: false },
		});

		dialogRef.afterClosed().subscribe((result) => {
			console.log(result);
			if (result) {
				this.createCategory(result.name, result.weighted);
			}
		});
	}

	createCategory(name: string, weighted: boolean) {
		this.categoryService
			.createCategory(name, this.eventId, weighted)
			.subscribe({
				next: (category) => {
					this.categories.push(category);
					this.messageService.showSuccess('Category created!');
				},
				error: () => {
					this.messageService.showError('Error creating category');
				},
			});
	}

	addUser(categoryId: number) {
		if (this.name.value) {
			this.categoryService
				.addUser(categoryId, +this.name.value, this.weight.value)
				.subscribe({
					next: (res) => {
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

						this.messageService.showSuccess(
							'User added to category "' +
								this.categories[index].name +
								'"'
						);
					},
					error: () => {
						this.messageService.showError(
							'Error adding user to category'
						);
					},
				});
		}
	}

	removeUser(categoryId: number, userId: number) {
		this.categoryService.deleteUser(categoryId, userId).subscribe({
			next: (res) => {
				const index = this.categories.findIndex(
					(category) => category.id === res.id
				);
				if (index > -1) {
					this.categories[index].users = res.users;
					this.cd.detectChanges();
				}
				this.messageService.showSuccess(
					'User removed from category "' +
						this.categories[index].name +
						'"'
				);
			},
			error: () => {
				this.messageService.showError(
					'Error removing user from category'
				);
			},
		});
	}

	openEditDialog(categoryId: number, userId: number) {
		const dialogRef = this.dialog.open(CategoryEditDialogComponent, {
			width: '350px',
			data: { categoryId, userId },
		});

		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				this.editCategory(categoryId, userId, res);
			}
		});
	}

	editCategory(categoryId: number, userId: number, weight: number) {
		this.categoryService.editUser(categoryId, userId, weight).subscribe({
			next: (res) => {
				const catIndex = this.categories.findIndex((category) => {
					return category.id === res.id;
				});
				if (catIndex > -1) {
					const userIndex = this.categories[catIndex].users.findIndex(
						(user) => {
							return user.id === userId;
						}
					);
					if (userIndex > -1) {
						this.categories[catIndex].users[userIndex].weight =
							weight;
						this.messageService.showSuccess('Category edited!');
					}
				}
			},
			error: () => {
				this.messageService.showError('Error editing category');
			},
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
