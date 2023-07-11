import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/validators/form-control.pipe';
import { ApiError } from 'src/app/types/apiError.type';
import { CategoryIcon } from 'src/app/types/enums';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryEditDialogComponent } from './category-edit-dialog/category-edit-dialog.component';

@Component({
	selector: 'app-category',
	templateUrl: './category.component.html',
	styleUrls: ['./category.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		NgIf,
		MatExpansionModule,
		NgFor,
		MatTableModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		ProgressSpinnerComponent,
		MatCardModule,
		AsyncPipe,
		MatDialogModule,
		FormControlPipe,
		MatSelectModule,
	],
})
export class CategoryComponent implements OnInit, AfterViewChecked {
	private eventId!: string;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	addUserForm = new FormGroup({
		participantName: new FormControl('', [Validators.required]),
		weight: new FormControl(1, [Validators.required]),
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
		private messageService: MessageService,
		public breakpointService: BreakpointService
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

	filterUsers(categoryId: string) {
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
			width: '380px',
			data: { weighted: false },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.createCategory(result.categoryName, result.weighted, result.selectedIcon);
			}
		});
	}

	createCategory(name: string, weighted: boolean, icon: CategoryIcon) {
		this.categoryService.createCategory(name, this.eventId, weighted, icon).subscribe({
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

	addUser(categoryId: string) {
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
					this.addUserForm.get('weight')?.setValue(1);

					this.messageService.showSuccess('User added to category "' + this.categories[index].name + '"');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error adding user to category');
					console.error('something went wrong while adding user to category', err?.error?.message);
				},
			});
		}
	}

	removeUser(categoryId: string, userId: string) {
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

	openEditDialog(categoryId: string, userId: string, weight: number) {
		const dialogRef = this.dialog.open(CategoryEditDialogComponent, {
			width: '300px',
			data: { categoryId, userId, weight },
		});

		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				this.editCategory(categoryId, userId, res.weight);
			}
		});
	}

	editCategory(categoryId: string, userId: string, weight: number) {
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

	toggleWeighted(categoryId: string, weighted: boolean) {
		this.categoryService.setWeighted(categoryId, !weighted).subscribe({
			next: (result) => {
				const category = this.categories.indexOf(
					this.categories.find((category) => {
						return category.id === result.id;
					})
				);
				if (~category) {
					Object.assign(this.categories[category], result);
				}
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to toggle weighted status');
				console.error('something went wrong while toggling category weight', err?.error?.message);
			},
		});
	}

	deleteCategoryDialog(categoryId: string) {
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

	deleteCategory(categoryId: string) {
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
