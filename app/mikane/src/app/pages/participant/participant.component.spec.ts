import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { MessageService } from 'src/app/services/message/message.service';

import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { User, UserBalance, UserService } from 'src/app/services/user/user.service';
import { CategoryIcon } from 'src/app/types/enums';
import { ExpenditureDialogComponent } from '../expenditures/expenditure-dialog/expenditure-dialog.component';
import { ExpenseDataSource } from './expense.datasource';
import { ParticipantComponent } from './participant.component';
import { ParticipantDialogComponent } from './user-dialog/participant-dialog.component';

describe('ParticipantComponent', () => {
	let component: ParticipantComponent;
	let fixture: MockedComponentFixture<ParticipantComponent, { $event: Observable<PuddingEvent> }>;
	let userServiceStub: UserService;
	let eventServiceStub: EventService;
	let routerStub: Router;
	let dialogStub: MatDialog;
	let messageServiceStub: MessageService;
	let expenseServiceStub: ExpenseService;
	let categoryServiceStub: CategoryService;
	let authServiceStub: AuthService;
	let contextServiceStub: ContextService;

	beforeEach(() => {
		userServiceStub = jasmine.createSpyObj('UserService', ['loadUsers', 'createUser']);
		eventServiceStub = jasmine.createSpyObj('EventService', ['loadBalances', 'addUser', 'removeUser']);
		routerStub = jasmine.createSpyObj('Router', ['navigate']);
		dialogStub = jasmine.createSpyObj('MatDialog', ['open']);
		messageServiceStub = jasmine.createSpyObj('MessageService', ['showError', 'showSuccess']);
		expenseServiceStub = jasmine.createSpyObj('ExpenseService', ['createExpense', 'deleteExpense']);
		categoryServiceStub = jasmine.createSpyObj('CategoryService', ['findOrCreate']);
		authServiceStub = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
		contextServiceStub = jasmine.createSpyObj('ContextService', ['isMobile']);

		return MockBuilder(ParticipantComponent)
			.provide({ provide: UserService, useValue: userServiceStub })
			.provide({ provide: EventService, useValue: eventServiceStub })
			.provide({ provide: Router, useValue: routerStub })
			.provide({ provide: MatDialog, useValue: dialogStub })
			.provide({ provide: ExpenseService, useValue: expenseServiceStub })
			.provide({ provide: CategoryService, useValue: categoryServiceStub })
			.provide({ provide: AuthService, useValue: authServiceStub })
			.provide({ provide: ContextService, useValue: contextServiceStub })
			.provide({ provide: MessageService, useValue: messageServiceStub })
			.mock(MatCardModule)
			.mock(MatIconModule)
			.mock(MatDialogModule);
	});

	function createComponent() {
		fixture = MockRender(ParticipantComponent, {
			$event: of({
				id: '1',
				name: 'Test Event',
				private: false,
				status: {
					id: EventStatusType.ACTIVE,
					name: 'Active',
				},
				adminIds: []
			} as PuddingEvent),
		});
		component = fixture.point.componentInstance;
		component.currentUser = { id: '000' } as User;
		fixture.detectChanges();
	}

	it('should create', () => {
		createComponent();

		expect(component).toBeTruthy();
	});

	it('should load event', () => {
		createComponent();

		expect(component.event).toEqual({ id: '1', name: 'Test Event', private: false, status: { id: EventStatusType.ACTIVE, name: 'Active' }, adminIds: [] } as PuddingEvent);
		expect(component.displayedColumns).toContain('actions');
	});

	it('should not load event if not present', () => {
		fixture = MockRender(ParticipantComponent);
		component = fixture.point.componentInstance;
		fixture.detectChanges();

		expect(component.event).toBeUndefined();
		expect(component.displayedColumns).not.toContain('actions');
	});

	describe('#loadUsers', () => {
		describe('', () => {
			beforeEach(() => {
				(eventServiceStub.loadBalances as jasmine.Spy).and.returnValue(
					of([
						{ user: { id: '1', eventInfo: { isAdmin: true } }, balance: 1 },
						{ user: { id: '2' }, balance: 2 },
						{ user: { id: '3' }, balance: 3 },
					] as UserBalance[]),
				);
				(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' }));
			});

			it('should set admin flag', () => {
				createComponent();

				expect(component.isAdmin).toBeTrue();
			});

			it('should set in event flag', () => {
				createComponent();

				expect(component.inEvent).toBeTrue();
			});

			it('should load users with balance', () => {
				createComponent();

				expect(component.usersWithBalance).toEqual([
					{ user: { id: '1', eventInfo: { isAdmin: true } }, balance: 1 },
					{ user: { id: '2' }, balance: 2 },
					{ user: { id: '3' }, balance: 3 },
				] as UserBalance[]);

				expect(component.dataSources.length).toBe(3);
			});
		});

		describe('with error', () => {
			beforeEach(() => {
				(eventServiceStub.loadBalances as jasmine.Spy).and.returnValue(throwError(() => 'test error'));
				(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' }));
			});

			it('should not have users with balance', () => {
				createComponent();

				expect(component.usersWithBalance).toEqual([]);
			});

			it('should show error message', () => {
				createComponent();

				expect(messageServiceStub.showError).toHaveBeenCalledWith('Error loading users and user balance');
			});
		});
	});

	describe('#joinEvent', () => {
		describe('', () => {
			beforeEach(() => {
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(of({} as PuddingEvent));
				(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' } as User));
			});

			it('should add user to event', () => {
				createComponent();

				component.joinEvent();

				expect(eventServiceStub.addUser).toHaveBeenCalledWith('1', '1');
			});

			it('should load users after joining event', () => {
				createComponent();

				component.joinEvent();

				expect(eventServiceStub.loadBalances).toHaveBeenCalledWith(component.event.id);
			});

			it('should show join event success message', () => {
				createComponent();

				component.joinEvent();

				expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Joined event successfully');
			});
		});

		describe('with add user error', () => {
			beforeEach(() => {
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(throwError(() => 'test error'));
				(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' } as User));
			});

			it('should show add user error message', () => {
				createComponent();

				component.joinEvent();

				expect(messageServiceStub.showError).toHaveBeenCalledWith('Error adding user to event');
			});
		});

		describe('with empty response', () => {
			beforeEach(() => {
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(of(undefined));
				(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' } as User));
			});

			it('should not show success message', () => {
				createComponent();

				component.joinEvent();

				expect(messageServiceStub.showSuccess).not.toHaveBeenCalled();
				expect(messageServiceStub.showError).toHaveBeenCalledWith('Something went wrong adding user to event');
			});
		});
	});

	describe('#openDialog', () => {
		describe('', () => {
			beforeEach(() => {
				(dialogStub.open as jasmine.Spy).and.returnValue({
					afterClosed: () =>
						of([
							{ id: '1', name: 'test', eventInfo: { isAdmin: true } },
							{ id: '2', name: 'test2' },
						] as User[]),
				});
				(userServiceStub.loadUsers as jasmine.Spy).and.returnValue(of([]));
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should open dialog', () => {
				createComponent();

				component.openDialog();

				expect(dialogStub.open).toHaveBeenCalledWith(ParticipantDialogComponent, {
					width: '350px',
					data: {
						users: jasmine.any(Observable),
					},
				});
			});

			it('should add users', () => {
				createComponent();

				component.openDialog();

				expect(eventServiceStub.addUser).toHaveBeenCalledWith('1', '1');
				expect(eventServiceStub.addUser).toHaveBeenCalledWith('1', '2');
			});

			it('should show success message', () => {
				createComponent();

				component.openDialog();

				expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Users added to event');
			});

			it('should load users after adding user', () => {
				createComponent();

				component.openDialog();

				expect(eventServiceStub.loadBalances).toHaveBeenCalledTimes(2);
			});
		});

		describe('with no users', () => {
			beforeEach(() => {
				(dialogStub.open as jasmine.Spy).and.returnValue({
					afterClosed: () => of([] as User[]),
				});
				(userServiceStub.loadUsers as jasmine.Spy).and.returnValue(of([]));
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should not add users', () => {
				createComponent();

				component.openDialog();

				expect(eventServiceStub.addUser).not.toHaveBeenCalled();
			});
		});

		describe('with user add error', () => {
			beforeEach(() => {
				(dialogStub.open as jasmine.Spy).and.returnValue({
					afterClosed: () =>
						of([
							{ id: '1', name: 'test', eventInfo: { isAdmin: true } },
							{ id: '2', name: 'test2' },
						] as User[]),
				});
				(userServiceStub.loadUsers as jasmine.Spy).and.returnValue(of([]));
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(throwError(() => 'test error'));
			});

			it('should show user add error message', () => {
				createComponent();

				component.openDialog();

				expect(messageServiceStub.showError).toHaveBeenCalledWith('Failed to add users to event');
			});
		});
	});

	describe('#createUser', () => {
		describe('', () => {
			beforeEach(() => {
				(userServiceStub.createUser as jasmine.Spy).and.returnValue(of({ id: '1' } as User));
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should create user', () => {
				createComponent();

				component.createUser({
					name: 'test',
				} as User);

				expect(userServiceStub.createUser).toHaveBeenCalledWith('1', 'test');
			});

			it('should show user creation success message', () => {
				createComponent();

				component.createUser({
					name: 'test',
				} as User);

				expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('User created');
			});

			it('should load users after creating user', () => {
				createComponent();

				component.createUser({
					name: 'test',
				} as User);

				expect(eventServiceStub.loadBalances).toHaveBeenCalledWith(component.event.id);
			});
		});

		describe('with create user error', () => {
			beforeEach(() => {
				(userServiceStub.createUser as jasmine.Spy).and.returnValue(throwError(() => 'test error'));
				(eventServiceStub.addUser as jasmine.Spy).and.returnValue(
					of({
						id: '1',
					} as PuddingEvent),
				);
			});

			it('should show create user error message', () => {
				createComponent();

				component.createUser({
					name: 'test',
				} as User);

				expect(messageServiceStub.showError).toHaveBeenCalledWith('Failed to create user');
			});
		});
	});

	describe('#deleteUserDialog', () => {
		describe('when confirming dialog', () => {
			beforeEach(() => {
				(dialogStub.open as jasmine.Spy).and.returnValue({
					afterClosed: () => of(true),
				});
				(eventServiceStub.removeUser as jasmine.Spy).and.returnValue(of({} as PuddingEvent));
			});

			it('should open user deletion dialog', () => {
				createComponent();

				const user = { id: '1', name: 'user1' } as User;
				component.deleteUserDialog(user);

				expect(dialogStub.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
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
				createComponent();

				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(eventServiceStub.removeUser).toHaveBeenCalledWith('1', '1');
			});

			it('should show delete user success message', () => {
				createComponent();

				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('User removed!');
			});

			it('should load users after deleting user', () => {
				createComponent();

				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(eventServiceStub.loadBalances).toHaveBeenCalledWith(component.event.id);
			});
		});

		describe('when not confirming dialog', () => {
			beforeEach(() => {
				(dialogStub.open as jasmine.Spy).and.returnValue({
					afterClosed: () => of(false),
				});
				(eventServiceStub.removeUser as jasmine.Spy).and.returnValue(of({} as PuddingEvent));
			});

			it('should not delete user', () => {
				createComponent();

				component.deleteUserDialog({ id: '1', name: 'user1' } as User);

				expect(eventServiceStub.removeUser).not.toHaveBeenCalled();
			});
		});
	});

	describe('#removeUser', () => {
		describe('', () => {
			beforeEach(() => {
				(eventServiceStub.removeUser as jasmine.Spy).and.returnValue(of({} as PuddingEvent));
			});

			it('should remove user', () => {
				createComponent();

				component.removeUser('1');

				expect(eventServiceStub.removeUser).toHaveBeenCalledWith('1', '1');
			});

			it('should show remove user success message', () => {
				createComponent();

				component.removeUser('1');

				expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('User removed!');
			});

			it('should load users after removing user', () => {
				createComponent();

				component.removeUser('1');

				expect(eventServiceStub.loadBalances).toHaveBeenCalledWith(component.event.id);
			});
		});

		describe('with user remove error', () => {
			beforeEach(() => {
				(eventServiceStub.removeUser as jasmine.Spy).and.returnValue(throwError(() => 'test error'));
			});

			it('should show user remove error message', () => {
				createComponent();

				component.removeUser('1');

				expect(messageServiceStub.showError).toHaveBeenCalledWith('Failed to remove user');
			});
		});
	});

	describe('#getExpenses', () => {
		describe('', () => {
			it('should get expenses', () => {
				createComponent();

				component.dataSources = [jasmine.createSpyObj('ExpenseDataSource', ['loadExpenses', 'destroy'])] as ExpenseDataSource[];

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

			(dialogStub.open as jasmine.Spy).and.returnValue({
				afterClosed: () =>
					of({
						category: 'test',
						name: 'test',
						description: 'test',
						amount: 0,
						payerId: '1',
					}),
			});
			(expenseServiceStub.createExpense as jasmine.Spy).and.returnValue(of(returnExpense));
			(categoryServiceStub.findOrCreate as jasmine.Spy).and.returnValue(
				of({
					id: '1',
				} as Category),
			);
		});

		it('should open expense creation dialog', () => {
			createComponent();

			component.createExpenseDialog('1', jasmine.createSpyObj('ExpenseDataSource', ['addExpense']));

			expect(dialogStub.open).toHaveBeenCalledWith(ExpenditureDialogComponent, {
				width: '400px',
				data: {
					eventId: component.event.id,
					userId: '1',
				},
			});
		});

		it('should find or create category', () => {
			createComponent();

			component.createExpenseDialog('1', jasmine.createSpyObj('ExpenseDataSource', ['addExpense']));

			expect(categoryServiceStub.findOrCreate).toHaveBeenCalledWith(component.event.id, 'test');
		});

		it('should create expense', () => {
			createComponent();

			component.createExpenseDialog('1', jasmine.createSpyObj('ExpenseDataSource', ['addExpense']));

			expect(expenseServiceStub.createExpense).toHaveBeenCalledWith('test', 'test', 0, '1', '1', undefined);
		});

		it('should add expense to data source', () => {
			createComponent();

			const dataSource = jasmine.createSpyObj('ExpenseDataSource', ['addExpense']);
			component.createExpenseDialog('1', dataSource);

			expect(dataSource.addExpense).toHaveBeenCalledWith(returnExpense);
		});

		it('should show create expense success message', () => {
			createComponent();

			component.createExpenseDialog('1', jasmine.createSpyObj('ExpenseDataSource', ['addExpense']));

			expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Expense created');
		});

		it('should cancel if no expense is returned from dialog', () => {
			createComponent();

			(dialogStub.open as jasmine.Spy).and.returnValue({
				afterClosed: () => of(undefined),
			});

			const dataSource = jasmine.createSpyObj('ExpenseDataSource', ['addExpense']);
			component.createExpenseDialog('1', dataSource);

			expect(categoryServiceStub.findOrCreate).not.toHaveBeenCalled();
			expect(expenseServiceStub.createExpense).not.toHaveBeenCalled();
			expect(dataSource.addExpense).not.toHaveBeenCalled();
		});

		it('should show error is creating expense fails', () => {
			createComponent();

			(expenseServiceStub.createExpense as jasmine.Spy).and.returnValue(throwError(() => 'test error'));

			const dataSource = jasmine.createSpyObj('ExpenseDataSource', ['addExpense']);
			component.createExpenseDialog('1', dataSource);

			expect(messageServiceStub.showError).toHaveBeenCalledWith('Failed to create expense');
			expect(dataSource.addExpense).not.toHaveBeenCalled();
		});
	});

	describe('#deleteExpense', () => {
		describe('', () => {
			beforeEach(() => {
				(expenseServiceStub.deleteExpense as jasmine.Spy).and.returnValue(of(null));
			});

			it('should delete expense', () => {
				createComponent();

				component.deleteExpense('1', jasmine.createSpyObj('ExpenseDataSource', ['removeExpense']));

				expect(expenseServiceStub.deleteExpense).toHaveBeenCalledWith('1');
			});

			it('should show delete expense success message', () => {
				createComponent();

				component.deleteExpense('1', jasmine.createSpyObj('ExpenseDataSource', ['removeExpense']));

				expect(messageServiceStub.showSuccess).toHaveBeenCalledWith('Expense deleted');
			});

			it('should delete expense from data source', () => {
				createComponent();

				const dataSource = jasmine.createSpyObj('ExpenseDataSource', ['removeExpense']);
				component.deleteExpense('1', dataSource);

				expect(dataSource.removeExpense).toHaveBeenCalledWith('1');
			});
		});

		describe('with delete expense error', () => {
			beforeEach(() => {
				(expenseServiceStub.deleteExpense as jasmine.Spy).and.returnValue(throwError(() => 'test error'));
			});

			it('should show delete expense error message', () => {
				createComponent();

				component.deleteExpense('1', jasmine.createSpyObj('ExpenseDataSource', ['removeExpense']));

				expect(messageServiceStub.showError).toHaveBeenCalledWith('Failed to delete expense from user');
			});
		});
	});

	describe('#sortData', () => {
		beforeEach(() => {
			(eventServiceStub.loadBalances as jasmine.Spy).and.returnValue(
				of([
					{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
					{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
					{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				] as UserBalance[]),
			);
			(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' }));

			createComponent();

			component.accordion = jasmine.createSpyObj('accordion', ['closeAll']);
		});

		it('should sort by user name ascending', () => {
			component.sortData({ active: 'name', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by user name descending', () => {
			component.sortData({ active: 'name', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by balance ascending', () => {
			component.sortData({ active: 'balance', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by balance descending', () => {
			component.sortData({ active: 'balance', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by expenses count ascending', () => {
			component.sortData({ active: 'expensesCount', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by expenses count descending', () => {
			component.sortData({ active: 'expensesCount', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by spending ascending', () => {
			component.sortData({ active: 'costs', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by spending descending', () => {
			component.sortData({ active: 'costs', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by expenses ascending', () => {
			component.sortData({ active: 'expenses', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by expenses descending', () => {
			component.sortData({ active: 'expenses', direction: 'desc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
			] as UserBalance[]);
		});

		it('should sort by default', () => {
			component.sortData({ active: '', direction: '' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should sort by invalid column', () => {
			component.sortData({ active: 'invalid', direction: 'asc' });

			expect(component.usersWithBalance).toEqual([
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});

		it('should send sorted list to user balance subject', () => {
			component.sortData({ active: 'name', direction: 'asc' });

			expect(component.usersWithBalance$.getValue()).toEqual([
				{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1 },
				{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				{ user: { id: '3', name: 'c' }, balance: 3, expensesCount: 3, spending: 3, expenses: 3 },
			] as UserBalance[]);
		});
	});

	describe('#gotoInfo', () => {
		it('should navigate to info page', () => {
			createComponent();

			component.gotoInfo();

			expect(routerStub.navigate).toHaveBeenCalledWith(['events', component.event.id, 'info']);
		});
	});

	describe('#gotoSettings', () => {
		it('should navigate to settings page', () => {
			createComponent();

			component.gotoSettings();

			expect(routerStub.navigate).toHaveBeenCalledWith(['events', component.event.id, 'settings']);
		});
	});

	describe('#gotoUserExpenses', () => {
		beforeEach(() => {
			(eventServiceStub.loadBalances as jasmine.Spy).and.returnValue(
				of([
					{ user: { id: '1', name: 'a' }, balance: 1, expensesCount: 1, spending: 1, expenses: 1  },
					{ user: { id: '2', name: 'b' }, balance: 2, expensesCount: 2, spending: 2, expenses: 2 },
				] as UserBalance[]),
			);
			(authServiceStub.getCurrentUser as jasmine.Spy).and.returnValue(of({ id: '1' }));
		});

		it('should navigate to expenses page, filtered by user', () => {
			createComponent();

			component.gotoUserExpenses(component.usersWithBalance[0]);

			expect(routerStub.navigate).toHaveBeenCalledWith(['events', component.event.id, 'expenses'], {
				queryParams: { payers: component.usersWithBalance[0].user.id }
			});
		});
	});
});
