import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';

import { ChangeDetectorRef } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { CategoryIcon } from 'src/app/types/enums';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryEditDialogComponent } from './category-edit-dialog/category-edit-dialog.component';
import { CategoryComponent } from './category.component';

describe('CategoryComponent', () => {
	let component: CategoryComponent;
	let fixture: MockedComponentFixture<CategoryComponent, { $event: Observable<PuddingEvent> }>;
	let categoryServiceStub: jasmine.SpyObj<CategoryService>;
	let userServiceStub: jasmine.SpyObj<UserService>;
	let dialogStub: jasmine.SpyObj<MatDialog>;
	let changeDetectorRefStub: jasmine.SpyObj<ChangeDetectorRef>;
	let messageServiceStub: jasmine.SpyObj<MessageService>;
	let breakpointObserverStub: jasmine.SpyObj<BreakpointService>;
	let contextServiceStub: jasmine.SpyObj<ContextService>;
	let users: User[];

	beforeEach(() => {
		categoryServiceStub = jasmine.createSpyObj('CategoryService', [
			'loadCategories',
			'createCategory',
			'editCategory',
			'addUser',
			'deleteUser',
			'editUser',
			'setWeighted',
			'deleteCategory',
		]);
		userServiceStub = jasmine.createSpyObj('UserService', ['loadUsersByEvent']);
		dialogStub = jasmine.createSpyObj('MatDialog', ['open']);
		changeDetectorRefStub = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
		messageServiceStub = jasmine.createSpyObj('MessageService', ['showError', 'showSuccess']);
		breakpointObserverStub = jasmine.createSpyObj('BreakpointService', ['isMobile']);
		contextServiceStub = jasmine.createSpyObj('ContextService', [], ['isIos']);

		return MockBuilder(CategoryComponent)
			.provide({ provide: CategoryService, useValue: categoryServiceStub })
			.provide({ provide: UserService, useValue: userServiceStub })
			.provide({ provide: MessageService, useValue: messageServiceStub })
			.provide({ provide: MatDialog, useValue: dialogStub })
			.provide({ provide: ChangeDetectorRef, useValue: changeDetectorRefStub })
			.provide({ provide: BreakpointService, useValue: breakpointObserverStub })
			.provide({ provide: ContextService, useValue: contextServiceStub })
			.mock(MatIconModule)
			.mock(MatCardModule);
	});

	function createComponent() {
		fixture = MockRender(CategoryComponent, {
			$event: of({
				id: '1',
				status: {
					id: EventStatusType.ACTIVE,
					name: 'Active',
				},
			} as PuddingEvent),
		});
		component = fixture.point.componentInstance;
		fixture.detectChanges();
	}

	it('should create', () => {
		createComponent();

		expect(component).toBeTruthy();
	});

	it('should set event', () => {
		createComponent();

		expect(component.event).toEqual({
			id: '1',
			status: {
				id: EventStatusType.ACTIVE,
				name: 'Active',
			},
		} as PuddingEvent);
	});

	it('should set event to undefined', () => {
		fixture = MockRender(CategoryComponent, {
			$event: of(undefined),
		});
		component = fixture.point.componentInstance;
		fixture.detectChanges();

		expect(component.event).toBeUndefined();
	});

	it('should set event to undefined if no id', () => {
		fixture = MockRender(CategoryComponent, {
			$event: of({
				id: undefined,
				status: {
					id: EventStatusType.ACTIVE,
					name: 'Active',
				},
			} as PuddingEvent),
		});
		component = fixture.point.componentInstance;
		fixture.detectChanges();

		expect(component.event).toBeUndefined();
	});

	it('should push save on displayedColumns if event active', () => {
		createComponent();

		expect(component.displayedColumns).toEqual(['name', 'weight', 'save']);
	});

	it('should not push save on displayedColumns if event active', () => {
		fixture = MockRender(CategoryComponent, {
			$event: of({
				id: '1',
				status: {
					id: EventStatusType.ARCHIVED,
					name: 'Archived',
				},
			} as PuddingEvent),
		});
		component = fixture.point.componentInstance;
		fixture.detectChanges();

		expect(component.displayedColumns).toEqual(['name', 'weight']);
	});

	it('should load categories', () => {
		createComponent();

		expect(categoryServiceStub.loadCategories).toHaveBeenCalledWith(component.event.id);
	});

	describe('#loadCategories', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [
							{
								id: '1',
								name: 'name',
								avatarURL: 'avatarURL',
								weight: 1,
							},
						],
					},
				] as Category[]),
			);
			userServiceStub.loadUsersByEvent.and.returnValue(of([]));
		});

		it('should set categories', () => {
			createComponent();
			component.loadCategories();

			expect(component.categories).toEqual([
				{
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 1,
						},
					],
				},
			] as Category[]);
		});

		it('should load users after categories', () => {
			createComponent();
			component.loadCategories();

			expect(userServiceStub.loadUsersByEvent).toHaveBeenCalledWith(component.event.id);
		});

		it('should set categories to undefined', () => {
			categoryServiceStub.loadCategories.and.returnValue(of(undefined));

			createComponent();
			component.loadCategories();

			expect(component.categories).toBeUndefined();
		});

		it('should show error if categories fail to load', () => {
			categoryServiceStub.loadCategories.and.returnValue(throwError('error'));

			createComponent();
			component.loadCategories();

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error loading categories');
		});
	});

	describe('#loadUsers', () => {
		it('should set users', () => {
			userServiceStub.loadUsersByEvent.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						avatarURL: 'avatarURL',
					},
				] as User[]),
			);

			createComponent();
			component.loadUsers();

			expect(component.users).toEqual([
				{
					id: '1',
					name: 'name',
					avatarURL: 'avatarURL',
				},
			] as User[]);
		});

		it('should set users to undefined', () => {
			userServiceStub.loadUsersByEvent.and.returnValue(of(undefined));

			createComponent();
			component.loadUsers();

			expect(component.users).toBeUndefined();
		});

		it('should show error if users fail to load', () => {
			userServiceStub.loadUsersByEvent.and.returnValue(throwError('error'));

			createComponent();
			component.loadUsers();

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error loading users');
		});
	});

	describe('#filterUsers', () => {
		beforeEach(() => {
			users = [
				{
					id: '1',
					name: 'name',
					avatarURL: 'avatarURL',
				},
				{
					id: '2',
					name: 'name2',
					avatarURL: 'avatarURL2',
				},
			] as User[];
			userServiceStub.loadUsersByEvent.and.returnValue(of(users));
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [
							{
								id: '1',
								name: 'name',
								avatarURL: 'avatarURL',
								weight: 1,
							},
						],
					},
					{
						id: '2',
						name: 'name2',
						weighted: false,
						users: [
							{
								id: '2',
								name: 'name2',
								avatarURL: 'avatarURL2',
								weight: 1,
							},
						],
					},
				] as Category[]),
			);
		});

		it('should return users in category', () => {
			createComponent();

			expect(component.filterUsers('1')).toEqual([
				{
					id: '2',
					name: 'name2',
					avatarURL: 'avatarURL2',
				},
			] as User[]);
		});

		it('should return empty', () => {
			createComponent();
			component.users = [];

			component.filterUsers('1');

			expect(component.filterUsers('name')).toEqual([]);
		});
	});

	describe('#openDialog', () => {
		beforeEach(() => {
			dialogStub.open.and.returnValue({
				afterClosed: () =>
					of({
						categoryName: 'name',
						weighted: false,
						selectedIcon: CategoryIcon.SHOPPING,
					}),
			} as MatDialogRef<CategoryDialogComponent>);
			categoryServiceStub.createCategory.and.returnValue(of({} as Category));
		});

		it('should open dialog', () => {
			createComponent();
			component.openDialog();

			expect(dialogStub.open).toHaveBeenCalledWith(CategoryDialogComponent, {
				width: '380px',
				data: {
					eventId: component.event.id,
					weighted: false,
				},
			});
		});

		it('should create category after closing dialog', () => {
			createComponent();
			component.openDialog();

			expect(categoryServiceStub.createCategory).toHaveBeenCalledWith('name', component.event.id, false, CategoryIcon.SHOPPING);
		});
	});

	describe('#openEditCategoryDialog', () => {
		beforeEach(() => {
			dialogStub.open.and.returnValue({
				afterClosed: () =>
					of({
						categoryName: 'name',
						selectedIcon: CategoryIcon.SHOPPING,
					}),
			} as MatDialogRef<CategoryDialogComponent>);
			categoryServiceStub.editCategory.and.returnValue(of({} as Category));
		});

		it('should open edit dialog', () => {
			createComponent();
			component.openEditCategoryDialog('1', 'category', CategoryIcon.SHOPPING);

			expect(dialogStub.open).toHaveBeenCalledWith(CategoryDialogComponent, {
				width: '380px',
				data: {
					categoryId: '1',
					name: 'category',
					icon: CategoryIcon.SHOPPING,
					eventId: component.event.id,
				},
			});
		});

		it('should edit category after closing dialog', () => {
			createComponent();
			component.openEditCategoryDialog('1', 'cateagory', CategoryIcon.SHOPPING);

			expect(categoryServiceStub.editCategory).toHaveBeenCalledWith('1', 'name', CategoryIcon.SHOPPING);
		});
	});

	describe('#createCategory', () => {
		beforeEach(() => {
			categoryServiceStub.createCategory.and.returnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [],
				} as Category),
			);
		});

		it('should create category', () => {
			createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(categoryServiceStub.createCategory).toHaveBeenCalledWith('name', component.event.id, false, CategoryIcon.SHOPPING);
		});

		it('should push category and show success message', () => {
			createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);
			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Category created');
		});

		it('should show error if category fails to create', () => {
			categoryServiceStub.createCategory.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error creating category');
		});

		it('should show error if category is undefined', () => {
			categoryServiceStub.createCategory.and.returnValue(of(undefined));

			createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error creating category');
		});
	});

	describe('#editCategory', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceStub.editCategory.and.returnValue(
				of({
					id: '1',
					name: 'new name',
					weighted: false,
					users: [],
				} as Category),
			);
		});

		it('should edit category', () => {
			createComponent();
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(categoryServiceStub.editCategory).toHaveBeenCalledWith('1', 'name', CategoryIcon.SHOPPING);
		});

		it('should push edited category and show success message', () => {
			createComponent();

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(component.categories).toEqual([{ id: '1', name: 'new name', weighted: false, users: [] }] as Category[]);
			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Category edited');
		});

		it('should show error if category fails to edit', () => {
			categoryServiceStub.editCategory.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error editing category');
		});

		it('should show error if edited category is undefined', () => {
			categoryServiceStub.editCategory.and.returnValue(of(undefined));

			createComponent();
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error editing category');
		});
	});

	describe('#addUser', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceStub.addUser.and.returnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 1,
						},
					],
				} as Category),
			);
		});

		it('should add user', () => {
			createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(categoryServiceStub.addUser).toHaveBeenCalledWith('1', 'name', 2);
		});

		it('should add users to category and show success message', () => {
			createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);

			component.addUser('1');

			expect(component.categories).toEqual([
				{
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 1,
						},
					],
				},
			] as Category[]);

			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('User added to category "' + 'name' + '"');
		});

		it('should reset form values and mark as untouched', () => {
			createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(component.addUserForm.get('participantName').value).toEqual('');
			expect(component.addUserForm.get('weight').value).toEqual(1);
			expect(component.addUserForm.get('participantName').untouched).toBeTruthy();
		});

		it('should show error if user fails to add', () => {
			categoryServiceStub.addUser.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error adding user to category');
		});

		it('should show error if user added category is undefined', () => {
			categoryServiceStub.addUser.and.returnValue(of(undefined));

			createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error adding user to category');
		});
	});

	describe('#removeUser', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [
							{
								id: '1',
								name: 'name',
								avatarURL: 'avatarURL',
								weight: 1,
							},
						],
					},
				] as Category[]),
			);

			categoryServiceStub.deleteUser.and.returnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [],
				} as Category),
			);
		});

		it('should remove user', () => {
			createComponent();
			component.removeUser('1', '1');

			expect(categoryServiceStub.deleteUser).toHaveBeenCalledWith('1', '1');
		});

		it('should remove user from category and show success message', () => {
			createComponent();

			expect(component.categories).toEqual([
				{
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 1,
						},
					],
				},
			] as Category[]);

			component.removeUser('1', '1');

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);
			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('User removed from category "' + 'name' + '"');
		});

		it('should show error if user fails to remove', () => {
			categoryServiceStub.deleteUser.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.removeUser('1', '1');

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error removing user from category');
		});

		it('should show error if user removed category is undefined', () => {
			categoryServiceStub.deleteUser.and.returnValue(of(undefined));

			createComponent();
			component.removeUser('1', '1');

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error removing user from category');
		});
	});

	describe('#openWeightEditDialog', () => {
		beforeEach(() => {
			dialogStub.open.and.returnValue({
				afterClosed: () => of({ weight: 2 }),
			} as MatDialogRef<CategoryEditDialogComponent>);
			categoryServiceStub.editUser.and.returnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 1,
						},
					],
				} as Category),
			);
		});

		it('should open weight edit dialog', () => {
			createComponent();
			component.openWeightEditDialog('1', '1', 2);

			expect(dialogStub.open).toHaveBeenCalledWith(CategoryEditDialogComponent, {
				width: '300px',
				data: {
					categoryId: '1',
					userId: '1',
					weight: 2,
				},
			});
		});

		it('should edit user after closing dialog', () => {
			createComponent();
			component.openWeightEditDialog('1', '1', 2);

			expect(categoryServiceStub.editUser).toHaveBeenCalledWith('1', '1', 2);
		});
	});

	describe('#editCategoryWeight', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [
							{
								id: '1',
								name: 'name',
								avatarURL: 'avatarURL',
								weight: 1,
							},
						],
					},
				] as Category[]),
			);

			categoryServiceStub.editUser.and.returnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 2,
						},
					],
				} as Category),
			);
		});

		it('should edit user', () => {
			createComponent();
			component.editCategoryWeight('1', '1', 2);

			expect(categoryServiceStub.editUser).toHaveBeenCalledWith('1', '1', 2);
		});

		it('should edit user and show success message', () => {
			createComponent();

			expect(component.categories).toEqual([
				{
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 1,
						},
					],
				},
			] as Category[]);

			component.editCategoryWeight('1', '1', 2);

			expect(component.categories).toEqual([
				{
					id: '1',
					name: 'name',
					weighted: false,
					users: [
						{
							id: '1',
							name: 'name',
							avatarURL: 'avatarURL',
							weight: 2,
						},
					],
				},
			] as Category[]);

			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Category updated');
		});

		it('should show error if user fails to edit', () => {
			categoryServiceStub.editUser.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.editCategoryWeight('1', '1', 2);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error editing category');
		});

		it('should show error if user edited category is undefined', () => {
			categoryServiceStub.editUser.and.returnValue(of(undefined));

			createComponent();
			component.editCategoryWeight('1', '1', 2);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error editing category');
		});
	});

	describe('#toggleWeighted', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceStub.setWeighted.and.returnValue(
				of({
					id: '1',
					name: 'name',
					weighted: true,
					users: [],
				} as Category),
			);
		});

		it('should toggle weighted', () => {
			createComponent();
			component.toggleWeighted('1', false);

			expect(categoryServiceStub.setWeighted).toHaveBeenCalledWith('1', true);
		});

		it('should toggle weighted and show success message', () => {
			createComponent();

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);

			component.toggleWeighted('1', false);

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: true, users: [] }] as Category[]);
		});

		it('should show error if category fails to toggle weighted', () => {
			categoryServiceStub.setWeighted.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.toggleWeighted('1', false);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Failed to toggle weighted status');
		});

		it('should show error if toggled category is undefined', () => {
			categoryServiceStub.setWeighted.and.returnValue(of(undefined));

			createComponent();
			component.toggleWeighted('1', false);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error toggling weighted status');
		});
	});

	describe('#deleteCategoryDialog', () => {
		beforeEach(() => {
			dialogStub.open.and.returnValue({
				afterClosed: () => of(true),
			} as MatDialogRef<ConfirmDialogComponent>);
			categoryServiceStub.deleteCategory.and.returnValue(of([{}] as Category[]));
		});

		it('should open delete dialog', () => {
			createComponent();
			component.deleteCategoryDialog('1');

			expect(dialogStub.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
				width: '350px',
				data: {
					title: 'Delete Category',
					content: 'Are you sure you want to delete this category? All of its expenses will be permanently deleted!',
					confirm: 'I am sure',
				},
			});
		});

		it('should delete category after closing dialog', () => {
			createComponent();
			component.deleteCategoryDialog('1');

			expect(categoryServiceStub.deleteCategory).toHaveBeenCalledWith('1');
		});

		it('should not delete category if dialog is canceled', () => {
			dialogStub.open.and.returnValue({
				afterClosed: () => of(false),
			} as MatDialogRef<ConfirmDialogComponent>);

			createComponent();
			component.deleteCategoryDialog('1');

			expect(categoryServiceStub.deleteCategory).not.toHaveBeenCalled();
		});
	});

	describe('#deleteCategory', () => {
		beforeEach(() => {
			categoryServiceStub.loadCategories.and.returnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceStub.deleteCategory.and.returnValue(of([] as Category[]));
		});

		it('should delete category', () => {
			createComponent();
			component.deleteCategory('1');

			expect(categoryServiceStub.deleteCategory).toHaveBeenCalledWith('1');
		});

		it('should delete category and show success message', () => {
			createComponent();

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);

			component.deleteCategory('1');

			expect(component.categories).toEqual([]);
			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Category deleted');
		});

		it('should show error if category fails to delete', () => {
			categoryServiceStub.deleteCategory.and.returnValue(throwError(() => 'error'));

			createComponent();
			component.deleteCategory('1');

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Error deleting category');
		});
	});
});
