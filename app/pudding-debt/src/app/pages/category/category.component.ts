import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { map } from 'lodash-es';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MessageService } from 'src/app/services/message/message.service';
import { CategoryEditDialogComponent } from './category-edit-dialog/category-edit-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { ApiError } from 'src/app/types/apiError.type';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';

@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit, AfterViewChecked {
	private eventId!: number;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	addUserForm = new FormGroup({
		participantName: new FormControl('', [Validators.required]),
		weight: new FormControl(undefined, [Validators.required]),
	}) as FormGroup;

	categories: Category[] = [];
	users: User[] = [];
	displayedColumns: string[] = ['name', 'weight', 'save'];

	constructor(
		private categoryService: CategoryService,
		private userService: UserService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private cd: ChangeDetectorRef,
		private messageService: MessageService
	) {}

	ngOnInit(): void {
		this.route.parent?.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadCategories();
		});
	}

	ngAfterViewChecked(): void {
		this.cd.detectChanges();
	}

	loadCategories() {
		this.loading.next(true);
		this.categoryService.loadCategories(this.eventId).subscribe({
			next: (categories) => {
				this.categories = categories;
				this.loadUsers();
				this.loading.next(false);
			},
			error: (err: ApiError) => {
				this.loading.next(false);
				this.messageService.showError('Error loading categories');
				console.error('something went wrong while loading categories', err?.error?.message);
			},
		});
	}

	loadUsers() {
		this.userService.loadUsersByEvent(this.eventId).subscribe({
			next: (users) => {
				this.users = users;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Error loading users');
				console.error('something went wrong while loading users', err?.error?.message);
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
			if (result) {
				this.createCategory(result.categoryName, result.weighted);
			}
		});
	}

	createCategory(name: string, weighted: boolean) {
		this.categoryService.createCategory(name, this.eventId, weighted).subscribe({
			next: (category) => {
				this.categories.push(category);
				this.messageService.showSuccess('Category created!');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Error creating category');
				console.error('something went wrong while creating category', err?.error?.message);
			},
		});
	}

	addUser(categoryId: number) {
		if (this.addUserForm.value.participantName) {
			this.categoryService.addUser(categoryId, this.addUserForm.value.participantName, this.addUserForm.value.weight ?? 1).subscribe({
				next: (res) => {
					const index = this.categories.findIndex((category) => category.id === res.id);
					if (index > -1) {
						this.categories[index].users = res.users;
						this.cd.detectChanges();
					}
					this.addUserForm.get('participantName')?.setValue('');
					this.addUserForm.get('participantName')?.markAsUntouched();
					this.addUserForm.get('weight')?.reset();

					this.messageService.showSuccess('User added to category "' + this.categories[index].name + '"');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error adding user to category');
					console.error('something went wrong while adding user to category', err?.error?.message);
				},
			});
		}
	}

	removeUser(categoryId: number, userId: number) {
		this.categoryService.deleteUser(categoryId, userId).subscribe({
			next: (res) => {
				const index = this.categories.findIndex((category) => category.id === res.id);
				if (index > -1) {
					this.categories[index].users = res.users;
					this.cd.detectChanges();
				}
				this.messageService.showSuccess('User removed from category "' + this.categories[index].name + '"');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Error removing user from category');
				console.error('something went wrong while removing user from category', err?.error?.message);
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
				this.editCategory(categoryId, userId, res.weight);
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
					const userIndex = this.categories[catIndex].users.findIndex((user) => {
						return user.id === userId;
					});
					if (userIndex > -1) {
						this.categories[catIndex].users[userIndex].weight = weight;
						this.messageService.showSuccess('Category edited!');
					}
				}
			},
			error: (err: ApiError) => {
				this.messageService.showError('Error editing category');
				console.error('something went wrong while editing category', err?.error?.message);
			},
		});
	}

	toggleWeighted(categoryId: number, weighted: boolean) {
		this.categoryService.setWeighted(categoryId, !weighted).subscribe({
			next: () => {
				const category = this.categories.find((category) => {
					return category.id === categoryId;
				});
				if (category) {
					category.weighted = !weighted;
				}
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to toggle weighted status');
				console.error('something went wrong while toggling category weight', err?.error?.message);
			},
		});
	}

	deleteCategoryDialog(categoryId: number) {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '350px',
			data: {
				title: 'Delete Category',
				content: 'Are you sure you want to delete this category? All of its expenses will be permanently deleted!',
				confirm: 'I am sure',
			},
		});

		dialogRef.afterClosed().subscribe((confirm) => {
			if (confirm) {
				this.deleteCategory(categoryId);
			}
		});
	}

	deleteCategory(categoryId: number) {
		this.categoryService.deleteCategory(categoryId).subscribe({
			next: () => {
				const index = this.categories.findIndex((category) => category.id === categoryId);
				this.categories.splice(index, 1);
				this.messageService.showSuccess('Successfully deleted category!');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Error deleting category');
				console.error('something went wrong while deleting category', err?.error?.message);
			},
		});
	}

	drop(event: CdkDragDrop<Category[]>) {
		moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
	}
}
