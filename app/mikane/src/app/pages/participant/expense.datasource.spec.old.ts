import { of } from 'rxjs';
import { Expense } from 'src/app/services/expense/expense.service';
import { UserService } from 'src/app/services/user/user.service';
import { ExpenseDataSource } from './expense.datasource';

describe('ExpenseDataSource', () => {
	let dataSource: ExpenseDataSource;
	let userServiceSpy: jasmine.SpyObj<UserService>;

	beforeEach(() => {
		userServiceSpy = jasmine.createSpyObj('UserService', ['loadUserExpenses']);
		userServiceSpy.loadUserExpenses.and.returnValue(
			of([
				{
					id: 'expenseId',
					name: 'expenseName',
					description: 'expenseDescription',
					amount: 100,
					created: new Date('2024-05-01'),
					categoryInfo: {
						id: 'categoryId',
						name: 'categoryName',
						icon: 'categoryIcon',
					},
					eventInfo: {
						id: 'eventId',
						name: 'eventName',
						private: false,
					},
					payer: {
						id: 'payerId',
						name: 'payerName',
						email: 'payerEmail',
					},
				},
			] as Expense[]),
		);
		dataSource = new ExpenseDataSource(userServiceSpy);
	});

	it('should be created', () => {
		expect(dataSource).toBeTruthy();
	});

	it('should load expenses', () => {
		dataSource.loadExpenses('userId', 'eventId');

		expect(userServiceSpy.loadUserExpenses).toHaveBeenCalledOnceWith('userId', 'eventId');
	});

	it('should remove expense', () => {
		const expenseId = 'expenseId';
		dataSource.addExpense({ id: expenseId } as Expense);
		dataSource.removeExpense(expenseId);

		expect(dataSource.notEmpty.value).toBeFalse();
	});

	it('should add expense', () => {
		const expenseId = 'expenseId';
		dataSource.addExpense({ id: expenseId } as Expense);

		expect(dataSource.notEmpty.value).toBeTrue();
	});

	it('should connect and get expenses', () => {
		dataSource.loadExpenses('userId', 'eventId');
		dataSource.connect().subscribe((expenses) => {
			expect(expenses).toEqual([
				{
					id: 'expenseId',
					name: 'expenseName',
					description: 'expenseDescription',
					amount: 100,
					created: new Date('2024-05-01'),
					categoryInfo: {
						id: 'categoryId',
						name: 'categoryName',
						icon: 'categoryIcon',
					},
					eventInfo: {
						id: 'eventId',
						name: 'eventName',
						private: false,
					},
					payer: {
						id: 'payerId',
						name: 'payerName',
						email: 'payerEmail',
					},
				},
			] as Expense[]);
		});
	});

	it('should set not empty to false when expenses are empty', () => {
		userServiceSpy.loadUserExpenses.and.returnValue(of([]));
		dataSource.loadExpenses('userId', 'eventId');
		dataSource.connect().subscribe(() => {
			expect(dataSource.notEmpty.value).toBeFalse();
		});
	});

	it('should set not empty to true when expenses are not empty', () => {
		dataSource.addExpense({ id: 'expenseId' } as Expense);
		dataSource.connect().subscribe(() => {
			expect(dataSource.notEmpty.value).toBeTrue();
		});
	});

	it('should set not empty when last expense is removed', () => {
		dataSource.addExpense({ id: 'expenseId' } as Expense);
		dataSource.removeExpense('expenseId');
		dataSource.connect().subscribe(() => {
			expect(dataSource.notEmpty.value).toBeFalse();
		});
	});

	afterEach(() => {
		dataSource.disconnect();
		dataSource.destroy();
	});
});
