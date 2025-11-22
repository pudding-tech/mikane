import { TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { CategoryIcon } from 'src/app/types/enums';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryEditDialogComponent } from './category-edit-dialog/category-edit-dialog.component';
import { CategoryComponent } from './category.component';

function createComponent(eventData?: Partial<PuddingEvent>) {
	const $event = new BehaviorSubject<PuddingEvent>({
		id: '1',
		status: {
			id: EventStatusType.ACTIVE,
			name: 'Active',
		},
		...(eventData || {}),
	} as PuddingEvent);

	const fixture = TestBed.createComponent(CategoryComponent);
	const component = fixture.componentInstance;
	fixture.componentRef.setInput('$event', $event);
	fixture.detectChanges();
	return { fixture, component, $event };
}

describe('CategoryComponent', () => {
	let categoryServiceSpy: {
		loadCategories: ReturnType<typeof vi.fn>;
		createCategory: ReturnType<typeof vi.fn>;
		editCategory: ReturnType<typeof vi.fn>;
		addUser: ReturnType<typeof vi.fn>;
		deleteUser: ReturnType<typeof vi.fn>;
		editUser: ReturnType<typeof vi.fn>;
		setWeighted: ReturnType<typeof vi.fn>;
		deleteCategory: ReturnType<typeof vi.fn>;
	};
	let userServiceSpy: { loadUsersByEvent: ReturnType<typeof vi.fn> };
	let dialogSpy: { open: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let breakpointServiceSpy: { isMobile: () => boolean };
	let contextServiceSpy: { isIos: () => boolean };
	let formValidationServiceSpy: object;
	let users: User[];

	beforeEach(() => {
		categoryServiceSpy = {
			loadCategories: vi.fn().mockReturnValue(of([])),
			createCategory: vi.fn(),
			editCategory: vi.fn(),
			addUser: vi.fn(),
			deleteUser: vi.fn(),
			editUser: vi.fn(),
			setWeighted: vi.fn(),
			deleteCategory: vi.fn(),
		};
		userServiceSpy = { loadUsersByEvent: vi.fn().mockReturnValue(of([])) };
		dialogSpy = { open: vi.fn() };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
		breakpointServiceSpy = { isMobile: () => false };
		contextServiceSpy = { isIos: () => false };
		formValidationServiceSpy = {};

		TestBed.configureTestingModule({
			imports: [CategoryComponent, MatCardModule, MatIconModule],
			providers: [
				{ provide: CategoryService, useValue: categoryServiceSpy },
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: MatDialog, useValue: dialogSpy },
				{ provide: BreakpointService, useValue: breakpointServiceSpy },
				{ provide: ContextService, useValue: contextServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: FormValidationService, useValue: formValidationServiceSpy },
			],
		})
			.overrideComponent(CategoryComponent, {
				remove: {
					imports: [MatDialogModule],
				},
			})
			.compileComponents();

		vi.clearAllMocks();
	});

	it('should create', () => {
		const { component } = createComponent();

		expect(component).toBeTruthy();
	});

	it('should set event', () => {
		const { component } = createComponent();

		expect(component.event).toEqual({
			id: '1',
			status: {
				id: EventStatusType.ACTIVE,
				name: 'Active',
			},
		} as PuddingEvent);
	});

	it('should set event to undefined', () => {
		const $event = new BehaviorSubject<PuddingEvent | undefined>(undefined);

		const fixture = TestBed.createComponent(CategoryComponent);
		const component = fixture.componentInstance;
		fixture.componentRef.setInput('$event', $event);
		fixture.detectChanges();

		expect(component.event).toBeUndefined();
	});

	it('should set event to undefined if no id', () => {
		const { component } = createComponent({ id: undefined });

		expect(component.event).toBeUndefined();
	});

	it('should push save on displayedColumns if event active', () => {
		const { component } = createComponent();

		expect(component.displayedColumns).toEqual(['name', 'weight', 'save']);
	});

	it('should not push save on displayedColumns if event not active', () => {
		const { component } = createComponent({ status: { id: EventStatusType.SETTLED, name: 'Settled' } });

		expect(component.displayedColumns).toEqual(['name', 'weight']);
	});

	it('should load categories', () => {
		const { component } = createComponent();

		expect(categoryServiceSpy.loadCategories).toHaveBeenCalledWith(component.event.id);
	});

	describe('#loadCategories', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
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
				]),
			);
			userServiceSpy.loadUsersByEvent.mockReturnValue(of([]));
		});

		it('should set categories', () => {
			const { component } = createComponent();
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
			]);
		});

		it('should load users after categories', () => {
			const { component } = createComponent();
			component.loadCategories();

			expect(userServiceSpy.loadUsersByEvent).toHaveBeenCalledWith(component.event.id);
		});

		it('should set categories to empty array', () => {
			categoryServiceSpy.loadCategories.mockReturnValue(of([]));

			const { component } = createComponent();
			component.loadCategories();

			expect(component.categories).toEqual([]);
		});

		it('should show error if categories fail to load', () => {
			categoryServiceSpy.loadCategories.mockReturnValue(throwError(() => new Error('error')));

			const { component } = createComponent();
			component.loadCategories();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading categories');
		});
	});

	describe('#loadUsers', () => {
		it('should set users', () => {
			userServiceSpy.loadUsersByEvent.mockReturnValue(
				of([
					{
						id: '1',
						name: 'name',
						avatarURL: 'avatarURL',
					},
				] as User[]),
			);

			const { component } = createComponent();
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
			userServiceSpy.loadUsersByEvent.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.loadUsers();

			expect(component.users).toBeUndefined();
		});

		it('should show error if users fail to load', () => {
			userServiceSpy.loadUsersByEvent.mockReturnValue(throwError(() => new Error('error')));

			const { component } = createComponent();
			component.loadUsers();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading users');
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
			userServiceSpy.loadUsersByEvent.mockReturnValue(of(users));
			categoryServiceSpy.loadCategories.mockReturnValue(
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
			const { component } = createComponent();

			expect(component.filterUsers('1')).toEqual([
				{
					id: '2',
					name: 'name2',
					avatarURL: 'avatarURL2',
				},
			] as User[]);
		});

		it('should return empty', () => {
			const { component } = createComponent();
			component.users = [];

			component.filterUsers('1');

			expect(component.filterUsers('name')).toEqual([]);
		});
	});

	describe('#openDialog', () => {
		beforeEach(() => {
			dialogSpy.open.mockReturnValue({
				afterClosed: () =>
					of({
						categoryName: 'name',
						weighted: false,
						selectedIcon: CategoryIcon.SHOPPING,
					}),
			} as MatDialogRef<CategoryDialogComponent>);
			categoryServiceSpy.createCategory.mockReturnValue(of({} as Category));
		});

		it('should open dialog', () => {
			const { component } = createComponent();
			component.openDialog();

			expect(dialogSpy.open).toHaveBeenCalledWith(CategoryDialogComponent, {
				width: '380px',
				data: {
					eventId: component.event.id,
					weighted: false,
				},
			});
		});

		it('should create category after closing dialog', () => {
			const { component } = createComponent();
			component.openDialog();

			expect(categoryServiceSpy.createCategory).toHaveBeenCalledWith('name', component.event.id, false, CategoryIcon.SHOPPING);
		});
	});

	describe('#openEditCategoryDialog', () => {
		beforeEach(() => {
			dialogSpy.open.mockReturnValue({
				afterClosed: () =>
					of({
						categoryName: 'name',
						selectedIcon: CategoryIcon.SHOPPING,
					}),
			} as MatDialogRef<CategoryDialogComponent>);
			categoryServiceSpy.editCategory.mockReturnValue(of({} as Category));
		});

		it('should open edit dialog', () => {
			const { component } = createComponent();
			component.openEditCategoryDialog('1', 'category', CategoryIcon.SHOPPING);

			expect(dialogSpy.open).toHaveBeenCalledWith(CategoryDialogComponent, {
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
			const { component } = createComponent();
			component.openEditCategoryDialog('1', 'category', CategoryIcon.SHOPPING);

			expect(categoryServiceSpy.editCategory).toHaveBeenCalledWith('1', 'name', CategoryIcon.SHOPPING);
		});
	});

	describe('#createCategory', () => {
		beforeEach(() => {
			categoryServiceSpy.createCategory.mockReturnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [],
				} as Category),
			);
		});

		it('should create category', () => {
			const { component } = createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(categoryServiceSpy.createCategory).toHaveBeenCalledWith('name', component.event.id, false, CategoryIcon.SHOPPING);
		});

		it('should push category and show success message', () => {
			const { component } = createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Category created');
		});

		it('should show error if category fails to create', () => {
			categoryServiceSpy.createCategory.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error creating category');
		});

		it('should show error if category is undefined', () => {
			categoryServiceSpy.createCategory.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.createCategory('name', false, CategoryIcon.SHOPPING);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error creating category');
		});
	});

	describe('#editCategory', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceSpy.editCategory.mockReturnValue(
				of({
					id: '1',
					name: 'new name',
					weighted: false,
					users: [],
				} as Category),
			);
		});

		it('should edit category', () => {
			const { component } = createComponent();
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(categoryServiceSpy.editCategory).toHaveBeenCalledWith('1', 'name', CategoryIcon.SHOPPING);
		});

		it('should push edited category and show success message', () => {
			const { component } = createComponent();

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(component.categories).toEqual([{ id: '1', name: 'new name', weighted: false, users: [] }] as Category[]);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Category edited');
		});

		it('should show error if category fails to edit', () => {
			categoryServiceSpy.editCategory.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error editing category');
		});

		it('should show error if edited category is undefined', () => {
			categoryServiceSpy.editCategory.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.editCategory('1', 'name', CategoryIcon.SHOPPING);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error editing category');
		});
	});

	describe('#addUser', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceSpy.addUser.mockReturnValue(
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
			const { component } = createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(categoryServiceSpy.addUser).toHaveBeenCalledWith('1', 'name', 2);
		});

		it('should add users to category and show success message', () => {
			const { component } = createComponent();
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

			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User added to category "' + 'name' + '"');
		});

		it('should reset form values and mark as untouched', () => {
			const { component } = createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(component.addUserForm.get('participantName').value).toEqual('');
			expect(component.addUserForm.get('weight').value).toEqual(1);
			expect(component.addUserForm.get('participantName').untouched).toBeTruthy();
		});

		it('should show error if user fails to add', () => {
			categoryServiceSpy.addUser.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error adding user to category');
		});

		it('should show error if user added category is undefined', () => {
			categoryServiceSpy.addUser.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.addUserForm.get('participantName').setValue('name');
			component.addUserForm.get('weight').setValue(2);

			component.addUser('1');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error adding user to category');
		});
	});

	describe('#removeUser', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
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

			categoryServiceSpy.deleteUser.mockReturnValue(
				of({
					id: '1',
					name: 'name',
					weighted: false,
					users: [],
				} as Category),
			);
		});

		it('should remove user', () => {
			const { component } = createComponent();
			component.removeUser('1', '1');

			expect(categoryServiceSpy.deleteUser).toHaveBeenCalledWith('1', '1');
		});

		it('should remove user from category and show success message', () => {
			const { component } = createComponent();

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
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User removed from category "' + 'name' + '"');
		});

		it('should show error if user fails to remove', () => {
			categoryServiceSpy.deleteUser.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.removeUser('1', '1');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error removing user from category');
		});

		it('should show error if user removed category is undefined', () => {
			categoryServiceSpy.deleteUser.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.removeUser('1', '1');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error removing user from category');
		});
	});

	describe('#openWeightEditDialog', () => {
		beforeEach(() => {
			dialogSpy.open.mockReturnValue({
				afterClosed: () => of({ weight: 2 }),
			} as MatDialogRef<CategoryEditDialogComponent>);
			categoryServiceSpy.editUser.mockReturnValue(
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
			const { component } = createComponent();
			component.openWeightEditDialog('1', '1', 2);

			expect(dialogSpy.open).toHaveBeenCalledWith(CategoryEditDialogComponent, {
				width: '300px',
				data: {
					categoryId: '1',
					userId: '1',
					weight: 2,
				},
			});
		});

		it('should edit user after closing dialog', () => {
			const { component } = createComponent();
			component.openWeightEditDialog('1', '1', 2);

			expect(categoryServiceSpy.editUser).toHaveBeenCalledWith('1', '1', 2);
		});
	});

	describe('#editCategoryWeight', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
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

			categoryServiceSpy.editUser.mockReturnValue(
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
			const { component } = createComponent();
			component.editCategoryWeight('1', '1', 2);

			expect(categoryServiceSpy.editUser).toHaveBeenCalledWith('1', '1', 2);
		});

		it('should edit user and show success message', () => {
			const { component } = createComponent();

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

			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Category updated');
		});

		it('should show error if user fails to edit', () => {
			categoryServiceSpy.editUser.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.editCategoryWeight('1', '1', 2);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error editing category');
		});

		it('should show error if user edited category is undefined', () => {
			categoryServiceSpy.editUser.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.editCategoryWeight('1', '1', 2);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error editing category');
		});
	});

	describe('#toggleWeighted', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceSpy.setWeighted.mockReturnValue(
				of({
					id: '1',
					name: 'name',
					weighted: true,
					users: [],
				} as Category),
			);
		});

		it('should toggle weighted', () => {
			const { component } = createComponent();
			component.toggleWeighted('1', false);

			expect(categoryServiceSpy.setWeighted).toHaveBeenCalledWith('1', true);
		});

		it('should toggle weighted and show success message', () => {
			const { component } = createComponent();

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);

			component.toggleWeighted('1', false);

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: true, users: [] }] as Category[]);
		});

		it('should show error if category fails to toggle weighted', () => {
			categoryServiceSpy.setWeighted.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.toggleWeighted('1', false);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to toggle weighted status');
		});

		it('should show error if toggled category is undefined', () => {
			categoryServiceSpy.setWeighted.mockReturnValue(of(undefined));

			const { component } = createComponent();
			component.toggleWeighted('1', false);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error toggling weighted status');
		});
	});

	describe('#deleteCategoryDialog', () => {
		beforeEach(() => {
			dialogSpy.open.mockReturnValue({
				afterClosed: () => of(true),
			} as MatDialogRef<ConfirmDialogComponent>);
			categoryServiceSpy.deleteCategory.mockReturnValue(of([{}] as Category[]));
		});

		it('should open delete dialog', () => {
			const { component } = createComponent();
			component.deleteCategoryDialog('1');

			expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
				width: '350px',
				data: {
					title: 'Delete Category',
					content: 'Are you sure you want to delete this category?',
					confirm: 'I am sure',
				},
			});
		});

		it('should delete category after closing dialog', () => {
			const { component } = createComponent();
			component.deleteCategoryDialog('1');

			expect(categoryServiceSpy.deleteCategory).toHaveBeenCalledWith('1');
		});

		it('should not delete category if dialog is canceled', () => {
			dialogSpy.open.mockReturnValue({
				afterClosed: () => of(false),
			} as MatDialogRef<ConfirmDialogComponent>);

			const { component } = createComponent();
			component.deleteCategoryDialog('1');

			expect(categoryServiceSpy.deleteCategory).not.toHaveBeenCalled();
		});
	});

	describe('#deleteCategory', () => {
		beforeEach(() => {
			categoryServiceSpy.loadCategories.mockReturnValue(
				of([
					{
						id: '1',
						name: 'name',
						weighted: false,
						users: [],
					},
				] as Category[]),
			);

			categoryServiceSpy.deleteCategory.mockReturnValue(of([] as Category[]));
		});

		it('should delete category', () => {
			const { component } = createComponent();
			component.deleteCategory('1');

			expect(categoryServiceSpy.deleteCategory).toHaveBeenCalledWith('1');
		});

		it('should delete category and show success message', () => {
			const { component } = createComponent();

			expect(component.categories).toEqual([{ id: '1', name: 'name', weighted: false, users: [] }] as Category[]);

			component.deleteCategory('1');

			expect(component.categories).toEqual([]);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Category deleted');
		});

		it('should show error if category fails to delete', () => {
			categoryServiceSpy.deleteCategory.mockReturnValue(throwError(() => 'error'));

			const { component } = createComponent();
			component.deleteCategory('1');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error deleting category');
		});
	});
});
