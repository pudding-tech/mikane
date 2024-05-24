import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'lodash-es';
import { BehaviorSubject, Observable, Subject, filter, of, switchMap, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { CategoryItemComponent } from 'src/app/features/mobile/category-item/category-item.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { CategoryApiActions } from 'src/app/services/category/category.actions';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ScrollService } from 'src/app/services/scroll/scroll.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
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
		MatListModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		ProgressSpinnerComponent,
		MatCardModule,
		MatTooltipModule,
		AsyncPipe,
		MatDialogModule,
		FormControlPipe,
		MatSelectModule,
		CategoryItemComponent,
	],
})
export class CategoryComponent implements OnInit, AfterViewChecked, OnDestroy {
	@Input() $event: BehaviorSubject<PuddingEvent>;

	categories$: Observable<Category[]> = this.store.select((state) => state.categories);

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	readonly EventStatusType = EventStatusType;

	addUserForm = new FormGroup({
		participantName: new FormControl('', [Validators.required]),
		weight: new FormControl(1, [Validators.required, Validators.min(1)]),
	}) as FormGroup;

	event: PuddingEvent;
	categories: Category[] = [];
	users: User[] = [];
	displayedColumns: string[] = ['name', 'weight'];

	private destroy$ = new Subject<void>();

	constructor(
		private categoryService: CategoryService,
		private userService: UserService,
		public dialog: MatDialog,
		private cd: ChangeDetectorRef,
		private messageService: MessageService,
		public breakpointService: BreakpointService,
		public contextService: ContextService,
		public scrollService: ScrollService,
		private router: Router,
		private store: Store<{ categories: Category[] }>,
	) {}

	ngOnInit(): void {
		this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event) => {
					if (event.id) {
						return of(event);
					} else {
						return of(undefined);
					}
				}),
				takeUntil(this.destroy$),
			)
			.subscribe({
				next: (event) => {
					if (event.status.id === EventStatusType.ACTIVE) {
						this.displayedColumns.push('save');
					}
					this.event = event;
					this.loadCategories();
				},
			});
	}

	ngAfterViewChecked(): void {
		this.cd.detectChanges();
	}

	loadCategories() {
		this.loading.next(true);
		this.store.dispatch(CategoryApiActions.retrieveCategories({ eventId: this.event.id }));
		this.categoryService
			.loadCategories(this.event.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
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
		this.userService
			.loadUsersByEvent(this.event.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (users) => {
					this.users = users;
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error loading users');
					console.error('something went wrong while loading users', err?.error?.message);
				},
			});
	}

	filterUsers = (categoryId: string) => {
		const filterCategory = this.categories.find((category) => {
			return category.id === categoryId;
		});

		return this.users.filter((user) => {
			return (
				map(filterCategory?.users, (filterUser) => {
					return filterUser.id;
				}).indexOf(user.id) < 0
			);
		});
	};

	openDialog() {
		const dialogRef = this.dialog.open(CategoryDialogComponent, {
			width: '380px',
			data: { weighted: false, eventId: this.event.id },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.createCategory(result.categoryName, result.weighted, result.selectedIcon);
			}
		});
	}

	openEditCategoryDialog(categoryId: string, name: string, icon: CategoryIcon) {
		const dialogRef = this.dialog.open(CategoryDialogComponent, {
			width: '380px',
			data: { categoryId, name, icon, eventId: this.event.id },
		});

		dialogRef.afterClosed().subscribe((result) => {
			if (result) {
				this.editCategory(categoryId, result.categoryName, result.selectedIcon);
			}
		});
	}

	createCategory(name: string, weighted: boolean, icon: CategoryIcon) {
		this.categoryService
			.createCategory(name, this.event.id, weighted, icon)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (category) => {
					if (category) {
						this.categories.push(category);
						this.messageService.showSuccess('Category created');
					} else {
						this.messageService.showError('Error creating category');
						console.error('create category returned undefined');
					}
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error creating category');
					console.error('something went wrong while creating category', err?.error?.message);
				},
			});
	}

	editCategory(categoryId: string, name: string, icon: CategoryIcon) {
		this.categoryService
			.editCategory(categoryId, name, icon)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (newCategory) => {
					if (newCategory?.id) {
						Object.assign(
							this.categories?.find((category) => {
								return category?.id === categoryId;
							}),
							newCategory,
						);
						this.messageService.showSuccess('Category edited');
					} else {
						this.messageService.showError('Error editing category');
						console.error('edit category returned undefined');
					}
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error editing category');
					console.error('something went wrong while editing category', err);
				},
			});
	}

	addUser(categoryId: string) {
		if (this.addUserForm.value.participantName) {
			this.categoryService
				.addUser(categoryId, this.addUserForm.value.participantName, this.addUserForm.value.weight ?? 1)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (res) => {
						if (res) {
							const index = this.categories.findIndex((category) => category.id === res.id);
							if (index > -1) {
								this.categories[index].users = res.users;
								this.cd.detectChanges();
							}
							this.addUserForm.get('participantName')?.setValue('');
							this.addUserForm.get('participantName')?.markAsUntouched();
							this.addUserForm.get('weight')?.setValue(1);

							this.messageService.showSuccess('User added to category "' + this.categories[index].name + '"');
						} else {
							this.messageService.showError('Error adding user to category');
							console.error('add user to category returned undefined');
						}
					},
					error: (err: ApiError) => {
						this.messageService.showError('Error adding user to category');
						console.error('something went wrong while adding user to category', err?.error?.message);
					},
				});
		}
	}

	removeUser(categoryId: string, userId: string) {
		this.categoryService
			.deleteUser(categoryId, userId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res) => {
					if (res) {
						const index = this.categories.findIndex((category) => category?.id === res?.id);
						if (index > -1) {
							this.categories[index].users = res.users;
							this.cd.detectChanges();
						}
						this.messageService.showSuccess('User removed from category "' + this.categories[index].name + '"');
					} else {
						this.messageService.showError('Error removing user from category');
						console.error('remove user from category returned undefined');
					}
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error removing user from category');
					console.error('something went wrong while removing user from category', err?.error?.message);
				},
			});
	}

	openWeightEditDialog(categoryId: string, userId: string, weight: number) {
		const dialogRef = this.dialog.open(CategoryEditDialogComponent, {
			width: '300px',
			data: { categoryId, userId, weight },
		});

		dialogRef.afterClosed().subscribe((res) => {
			if (res) {
				this.editCategoryWeight(categoryId, userId, res.weight);
			}
		});
	}

	editCategoryWeight(categoryId: string, userId: string, weight: number) {
		this.categoryService
			.editUser(categoryId, userId, weight)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (res) => {
					if (res) {
						const catIndex = this.categories?.findIndex((category) => {
							return category?.id === res?.id;
						});
						if (catIndex > -1) {
							const userIndex = this.categories[catIndex].users.findIndex((user) => {
								return user.id === userId;
							});
							if (userIndex > -1) {
								this.categories[catIndex].users[userIndex].weight = weight;
								this.messageService.showSuccess('Category updated');
							}
						}
					} else {
						this.messageService.showError('Error editing category');
						console.error('edit category returned undefined');
					}
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error editing category');
					console.error('something went wrong while editing category', err?.error?.message);
				},
			});
	}

	toggleWeighted(categoryId: string, weighted: boolean) {
		this.categoryService
			.setWeighted(categoryId, !weighted)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (result) => {
					if (result) {
						const newCategory = this.categories.indexOf(
							this.categories.find((category) => {
								return category.id === result.id;
							}),
						);
						if (~newCategory) {
							Object.assign(this.categories[newCategory], result);
						}
					} else {
						this.messageService.showError('Error toggling weighted status');
						console.error('toggle weighted status returned undefined');
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
				content: 'Are you sure you want to delete this category?',
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
		this.categoryService
			.deleteCategory(categoryId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					const index = this.categories.findIndex((category) => category.id === categoryId);
					this.categories.splice(index, 1);
					this.messageService.showSuccess('Category deleted');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Error deleting category');
					console.error('something went wrong while deleting category', err?.error?.message);
				},
			});
	}

	gotoCategoryExpenses(category: Category) {
		if (category.numberOfExpenses < 1) {
			return;
		}
		this.router.navigate(['events', this.event.id, 'expenses'], {
			queryParams: { categories: category.id },
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
