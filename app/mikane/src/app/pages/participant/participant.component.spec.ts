import { registerLocaleData } from '@angular/common';
import localeNo from '@angular/common/locales/no';
import { TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserBalance, UserService } from 'src/app/services/user/user.service';
import { CategoryIcon } from 'src/app/types/enums';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenditureDialogComponent } from '../expenditures/expenditure-dialog/expenditure-dialog.component';
import { ExpenseDataSource } from './expense.datasource';
import { ParticipantComponent } from './participant.component';
import { ParticipantDialogComponent } from './user-dialog/participant-dialog.component';

function createComponent(eventData?: Partial<PuddingEvent>) {
	const $event = new BehaviorSubject<PuddingEvent>({
		id: '1',
		name: 'Test Event',
		private: false,
		status: {
			id: EventStatusType.ACTIVE,
			name: 'Active',
		},
		adminIds: [],
		...(eventData || {}),
	} as PuddingEvent);

	const fixture = TestBed.createComponent(ParticipantComponent);
	const component = fixture.componentInstance;
	fixture.componentRef.setInput('$event', $event);
	component.currentUser = { id: '000' } as User;
	fixture.detectChanges();
	return { fixture, component, $event };
}

describe('ParticipantComponent', () => {
	registerLocaleData(localeNo);
	let userServiceSpy: { loadUsers: ReturnType<typeof vi.fn>; createUser: ReturnType<typeof vi.fn> };
	let eventServiceSpy: {
		loadBalances: ReturnType<typeof vi.fn>;
		addUser: ReturnType<typeof vi.fn>;
		removeUser: ReturnType<typeof vi.fn>;
	};
	let routerSpy: { navigate: ReturnType<typeof vi.fn> };
	let dialogSpy: { open: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let expenseServiceSpy: { createExpense: ReturnType<typeof vi.fn>; deleteExpense: ReturnType<typeof vi.fn> };
	let categoryServiceSpy: { findOrCreate: ReturnType<typeof vi.fn> };
	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
	let contextServiceSpy: { isMobileDevice: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		userServiceSpy = { loadUsers: vi.fn(), createUser: vi.fn() };
		eventServiceSpy = { loadBalances: vi.fn(), addUser: vi.fn(), removeUser: vi.fn() };
		routerSpy = { navigate: vi.fn() };
		dialogSpy = { open: vi.fn() };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
		expenseServiceSpy = { createExpense: vi.fn(), deleteExpense: vi.fn() };
		categoryServiceSpy = { findOrCreate: vi.fn() };
		authServiceSpy = { getCurrentUser: vi.fn() };
		contextServiceSpy = { isMobileDevice: vi.fn() };

		TestBed.configureTestingModule({
			imports: [ParticipantComponent, MatCardModule, MatIconModule],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: EventService, useValue: eventServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: MatDialog, useValue: dialogSpy },
				{ provide: ExpenseService, useValue: expenseServiceSpy },
				{ provide: CategoryService, useValue: categoryServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: ContextService, useValue: contextServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
			],
		})
			.overrideComponent(ParticipantComponent, {
				remove: {
					imports: [MatDialogModule],
				},
			})
			.compileComponents();
	});

	it('should create', () => {
		const { component } = createComponent();

		expect(component).toBeTruthy();
	});

	it('should load event', () => {
		const { component } = createComponent();

		expect(component.event).toEqual({
			id: '1',
			name: 'Test Event',
			private: false,
			status: { id: EventStatusType.ACTIVE, name: 'Active' },
			adminIds: [],
		} as PuddingEvent);

		expect(component.displayedColumns).toContain('actions');
	});

	it('should not load event if not present', () => {
		const fixture = TestBed.createComponent(ParticipantComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();

		expect(component.event).toBeUndefined();
		expect(component.displayedColumns).not.toContain('actions');
	});

	describe('#loadUsers', () => {
		describe('', () => {
			beforeEach(() => {
				eventServiceSpy.loadBalances.mockReturnValue(
					of([
						{ user: { id: '1', eventInfo: { isAdmin: true }, avatarURL: 'u1' }, balance: 1 },
						{ user: { id: '2', avatarURL: 'u2' }, balance: 2 },
						{ user: { id: '3', avatarURL: 'u3' }, balance: 3 },
					] as UserBalance[]),
				);
				authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' }));
			});

			it('should set admin flag', () => {
				const { component } = createComponent();

				expect(component.isAdmin).toBeTruthy();
			});

			it('should set in event flag', () => {
				const { component } = createComponent();

				expect(component.inEvent).toBeTruthy();
			});

			it('should load users with balance', () => {
				const { component } = createComponent();

				expect(component.usersWithBalance).toEqual([
					{ user: { id: '1', eventInfo: { isAdmin: true }, avatarURL: 'u1' }, balance: 1 },
					{ user: { id: '2', avatarURL: 'u2' }, balance: 2 },
					{ user: { id: '3', avatarURL: 'u3' }, balance: 3 },
				] as UserBalance[]);

				expect(component.dataSources.length).toBe(3);
			});
		});

		describe('with error', () => {
			beforeEach(() => {
				eventServiceSpy.loadBalances.mockReturnValue(throwError(() => 'test error'));
				authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' }));
			});

			it('should not have users with balance', () => {
				const { component } = createComponent();

				expect(component.usersWithBalance).toEqual([]);
			});

			it('should show error message', () => {
				createComponent();

				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading users and user balance');
			});
		});
	});

	describe('#joinEvent', () => {
		describe('', () => {
			beforeEach(() => {
				eventServiceSpy.addUser.mockReturnValue(of({} as PuddingEvent));
				authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' } as User));
			});

			it('should add user to event', () => {
				const { component } = createComponent();

				component.joinEvent();

				expect(eventServiceSpy.addUser).toHaveBeenCalledWith('1', '1');
			});

			it('should load users after joining event', () => {
				const { component } = createComponent();

				component.joinEvent();

				expect(eventServiceSpy.loadBalances).toHaveBeenCalledWith(component.event.id);
			});

			it('should show join event success message', () => {
				const { component } = createComponent();
				component.joinEvent();

				expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Joined event successfully');
			});
		});

		describe('with add user error', () => {
			beforeEach(() => {
				eventServiceSpy.addUser.mockReturnValue(throwError(() => 'test error'));
				authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' } as User));
			});

			it('should show add user error message', () => {
				const { component } = createComponent();
				component.joinEvent();

				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error adding user to event');
			});
		});

		describe('with empty response', () => {
			beforeEach(() => {
				eventServiceSpy.addUser.mockReturnValue(of(undefined));
				authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' } as User));
			});

			it('should not show success message', () => {
				const { component } = createComponent();
				component.joinEvent();

				expect(messageServiceSpy.showSuccess).not.toHaveBeenCalled();
				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Something went wrong adding user to event');
			});
		});
	});

	describe('#openDialog', () => {
		describe('', () => {
			beforeEach(() => {
				dialogSpy.open.mockReturnValue({
					afterClosed: () =>
						of([
							{ id: '1', name: 'test', eventInfo: { isAdmin: true }, avatarURL: 'u1' },
							{ id: '2', name: 'test2', avatarURL: 'u2' },
						] as User[]),
				});
				userServiceSpy.loadUsers.mockReturnValue(of([]));
				eventServiceSpy.addUser.mockReturnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should open dialog', () => {
				const { component } = createComponent();
				component.openDialog();

				expect(dialogSpy.open).toHaveBeenCalledWith(ParticipantDialogComponent, {
					width: '350px',
					data: {
						users: expect.any(Observable),
					},
				});
			});

			it('should add users', () => {
				const { component } = createComponent();
				component.openDialog();

				expect(eventServiceSpy.addUser).toHaveBeenCalledWith('1', '1');
				expect(eventServiceSpy.addUser).toHaveBeenCalledWith('1', '2');
			});

			it('should show success message', () => {
				const { component } = createComponent();
				component.openDialog();

				expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Users added to event');
			});

			it('should load users after adding user', () => {
				const { component } = createComponent();
				component.openDialog();

				expect(eventServiceSpy.loadBalances).toHaveBeenCalledTimes(2);
			});
		});

		describe('with no users', () => {
			beforeEach(() => {
				dialogSpy.open.mockReturnValue({
					afterClosed: () => of([] as User[]),
				});
				userServiceSpy.loadUsers.mockReturnValue(of([]));
				eventServiceSpy.addUser.mockReturnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should not add users', () => {
				const { component } = createComponent();
				component.openDialog();

				expect(eventServiceSpy.addUser).not.toHaveBeenCalled();
			});
		});

		describe('with user add error', () => {
			beforeEach(() => {
				dialogSpy.open.mockReturnValue({
					afterClosed: () =>
						of([
							{ id: '1', name: 'test', eventInfo: { isAdmin: true } },
							{ id: '2', name: 'test2' },
						] as User[]),
				});
				userServiceSpy.loadUsers.mockReturnValue(of([]));
				eventServiceSpy.addUser.mockReturnValue(throwError(() => 'test error'));
			});

			it('should show user add error message', () => {
				const { component } = createComponent();
				component.openDialog();

				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to add users to event');
			});
		});
	});

	describe('#createUser', () => {
		describe('', () => {
			beforeEach(() => {
				userServiceSpy.createUser.mockReturnValue(of({ id: '1' } as User));
				eventServiceSpy.addUser.mockReturnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should create user', () => {
				const { component } = createComponent();
				component.createUser({
					name: 'test',
				} as User);

				expect(userServiceSpy.createUser).toHaveBeenCalledWith('1', 'test');
			});

			it('should show user creation success message', () => {
				const { component } = createComponent();
				component.createUser({
					name: 'test',
				} as User);

				expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User created');
			});

			it('should load users after creating user', () => {
				const { component } = createComponent();
				component.createUser({
					name: 'test',
				} as User);

				expect(eventServiceSpy.loadBalances).toHaveBeenCalledWith(component.event.id);
			});
		});

		describe('with create user error', () => {
			beforeEach(() => {
				userServiceSpy.createUser.mockReturnValue(throwError(() => 'test error'));
				eventServiceSpy.addUser.mockReturnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should show create user error message', () => {
				const { component } = createComponent();
				component.createUser({
					name: 'test',
				} as User);

				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to create user');
			});
		});
	});

	describe('#deleteUserDialog', () => {
		describe('when confirming dialog', () => {
			beforeEach(() => {
				dialogSpy.open.mockReturnValue({
					afterClosed: () => of(true),
				});
				eventServiceSpy.removeUser.mockReturnValue(of({} as PuddingEvent));
			});

			it('should open user deletion dialog', () => {
				const { component } = createComponent();

				const user = { id: '1', name: 'user1' } as User;
				component.deleteUserDialog(user);

				expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
					width: '430px',
					data: {
						title: `Remove ${user.name} from ${component.event.name}`,
						content: 'Are you sure you want to remove this user?',
						extraContent: undefined,
						confirm: 'I am sure',
					},
				});
			});

			it('should delete user', () => {
				const { component } = createComponent();
				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(eventServiceSpy.removeUser).toHaveBeenCalledWith('1', '1');
			});

			it('should show delete user success message', () => {
				const { component } = createComponent();
				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User removed!');
			});

			it('should load users after deleting user', () => {
				const { component } = createComponent();
				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(eventServiceSpy.loadBalances).toHaveBeenCalledWith(component.event.id);
			});
		});

		describe('when not confirming dialog', () => {
			beforeEach(() => {
				dialogSpy.open.mockReturnValue({
					afterClosed: () => of(false),
				});
				eventServiceSpy.removeUser.mockReturnValue(of({} as PuddingEvent));
			});

			it('should not delete user', () => {
				const { component } = createComponent();
				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(eventServiceSpy.removeUser).not.toHaveBeenCalled();
			});
		});
	});

	describe('#removeUser', () => {
		describe('', () => {
			beforeEach(() => {
				eventServiceSpy.removeUser.mockReturnValue(of({} as PuddingEvent));
			});

			it('should remove user', () => {
				const { component } = createComponent();
				component.removeUser('1');

				expect(eventServiceSpy.removeUser).toHaveBeenCalledWith('1', '1');
			});

			it('should show remove user success message', () => {
				const { component } = createComponent();
				component.removeUser('1');

				expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User removed!');
			});

			it('should load users after removing user', () => {
				const { component } = createComponent();
				component.removeUser('1');

				expect(eventServiceSpy.loadBalances).toHaveBeenCalledWith(component.event.id);
			});
		});

		describe('with user remove error', () => {
			beforeEach(() => {
				eventServiceSpy.removeUser.mockReturnValue(throwError(() => 'test error'));
			});

			it('should show user remove error message', () => {
				const { component } = createComponent();
				component.removeUser('1');

				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to remove user');
			});
		});
	});

	describe('#getExpenses', () => {
		describe('', () => {
			it('should get expenses', () => {
				const { component } = createComponent();

				component.dataSources = [{ loadExpenses: vi.fn(), destroy: vi.fn() }] as unknown as ExpenseDataSource[];
				component.getExpenses({ id: '1' } as User, 0);

				expect(component.dataSources[0].loadExpenses).toHaveBeenCalledWith('1', '1');
			});
		});
	});

	describe('#createExpenseDialog', () => {
		let returnExpense: Expense;

		beforeEach(() => {
			returnExpense = {
				id: '1',
				name: 'test',
				description: 'test',
				amount: 0,
				payer: { id: '1' } as User,
				categoryInfo: { id: '1', name: 'test', icon: CategoryIcon.SHOPPING },
			} as Expense;

			dialogSpy.open.mockReturnValue({
				afterClosed: () =>
					of({
						category: 'test',
						name: 'test',
						description: 'test',
						amount: 0,
						payerId: '1',
					}),
			});
			expenseServiceSpy.createExpense.mockReturnValue(of(returnExpense));
			categoryServiceSpy.findOrCreate.mockReturnValue(
				of({
					id: '1',
				} as Category),
			);
		});

		it('should open expense creation dialog', () => {
			const { component } = createComponent();
			component.createExpenseDialog('1', { addExpense: vi.fn() } as unknown as ExpenseDataSource);

			expect(dialogSpy.open).toHaveBeenCalledWith(ExpenditureDialogComponent, {
				width: '400px',
				data: {
					eventId: component.event.id,
					userId: '1',
				},
			});
		});

		it('should find or create category', () => {
			const { component } = createComponent();
			component.createExpenseDialog('1', { addExpense: vi.fn() } as unknown as ExpenseDataSource);

			expect(categoryServiceSpy.findOrCreate).toHaveBeenCalledWith(component.event.id, 'test');
		});

		it('should create expense', () => {
			const { component } = createComponent();
			component.createExpenseDialog('1', { addExpense: vi.fn() } as unknown as ExpenseDataSource);

			expect(expenseServiceSpy.createExpense).toHaveBeenCalledWith('test', 'test', 0, '1', '1', undefined);
		});

		it('should add expense to data source', () => {
			const { component } = createComponent();

			const dataSource = { addExpense: vi.fn() } as unknown as ExpenseDataSource;
			component.createExpenseDialog('1', dataSource);

			expect(dataSource.addExpense).toHaveBeenCalledWith(returnExpense);
		});

		it('should show create expense success message', () => {
			const { component } = createComponent();
			component.createExpenseDialog('1', { addExpense: vi.fn() } as unknown as ExpenseDataSource);

			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Expense created');
		});

		it('should cancel if no expense is returned from dialog', () => {
			const { component } = createComponent();

			dialogSpy.open.mockReturnValue({
				afterClosed: () => of(undefined),
			});

			const dataSource = { addExpense: vi.fn() } as unknown as ExpenseDataSource;
			component.createExpenseDialog('1', dataSource);

			expect(categoryServiceSpy.findOrCreate).not.toHaveBeenCalled();
			expect(expenseServiceSpy.createExpense).not.toHaveBeenCalled();
			expect(dataSource.addExpense).not.toHaveBeenCalled();
		});

		it('should show error is creating expense fails', () => {
			const { component } = createComponent();

			expenseServiceSpy.createExpense.mockReturnValue(throwError(() => 'test error'));

			const dataSource = { addExpense: vi.fn() } as unknown as ExpenseDataSource;
			component.createExpenseDialog('1', dataSource);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to create expense');
			expect(dataSource.addExpense).not.toHaveBeenCalled();
		});
	});

	describe('#deleteExpense', () => {
		describe('', () => {
			beforeEach(() => {
				expenseServiceSpy.deleteExpense.mockReturnValue(of(null));
			});

			it('should delete expense', () => {
				const { component } = createComponent();
				component.deleteExpense('1', { removeExpense: vi.fn() } as unknown as ExpenseDataSource);

				expect(expenseServiceSpy.deleteExpense).toHaveBeenCalledWith('1');
			});

			it('should show delete expense success message', () => {
				const { component } = createComponent();
				component.deleteExpense('1', { removeExpense: vi.fn() } as unknown as ExpenseDataSource);

				expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Expense deleted');
			});

			it('should delete expense from data source', () => {
				const { component } = createComponent();

				const dataSource = { removeExpense: vi.fn() } as unknown as ExpenseDataSource;
				component.deleteExpense('1', dataSource);

				expect(dataSource.removeExpense).toHaveBeenCalledWith('1');
			});
		});

		describe('with delete expense error', () => {
			beforeEach(() => {
				expenseServiceSpy.deleteExpense.mockReturnValue(throwError(() => 'test error'));
			});

			it('should show delete expense error message', () => {
				const { component } = createComponent();
				component.deleteExpense('1', { removeExpense: vi.fn() } as unknown as ExpenseDataSource);

				expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to delete expense from user');
			});
		});
	});

	describe('#sortData', () => {
		beforeEach(() => {
			eventServiceSpy.loadBalances.mockReturnValue(
				of([
					{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
					{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
					{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				] as UserBalance[]),
			);
			authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' }));
		});

		it('should sort by user name ascending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'name', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by user name descending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'name', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by balance ascending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'balance', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by balance descending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'balance', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by expenses count ascending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'expensesCount', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by expenses count descending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'expensesCount', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by spending ascending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'costs', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by spending descending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'costs', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by expenses ascending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'expenses', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by expenses descending', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'expenses', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by default', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: '', direction: '' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by invalid column', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'invalid', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should send sorted list to user balance subject', () => {
			const { component } = createComponent();
			component.accordion = { closeAll: vi.fn() } as unknown as MatAccordion;
			component.sortData({ active: 'name', direction: 'asc' });

			expect(component.usersWithBalance$.getValue()).toEqual([
				{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c', avatarURL: '3' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});
	});

	describe('#gotoInfo', () => {
		it('should navigate to info page', () => {
			const { component } = createComponent();
			component.gotoInfo();

			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', component.event.id, 'info']);
		});
	});

	describe('#gotoSettings', () => {
		it('should navigate to settings page', () => {
			const { component } = createComponent();
			component.gotoSettings();

			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', component.event.id, 'settings']);
		});
	});

	describe('#gotoUserExpenses', () => {
		beforeEach(() => {
			eventServiceSpy.loadBalances.mockReturnValue(
				of([
					{ user: { id: '1', name: 'a', avatarURL: '1' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
					{ user: { id: '2', name: 'b', avatarURL: '2' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				] as UserBalance[]),
			);
			authServiceSpy.getCurrentUser.mockReturnValue(of({ id: '1' }));
		});

		it('should navigate to expenses page, filtered by user', () => {
			const { component } = createComponent();
			component.gotoUserExpenses(component.usersWithBalance[0]);

			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', component.event.id, 'expenses'], {
				queryParams: { payers: component.usersWithBalance[0].user.id },
			});
		});
	});
});
