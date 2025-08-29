import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { Expense, ExpenseService } from './expense.service';

describe('ExpenseService', () => {
	let service: ExpenseService;
	let httpTestingController: HttpTestingController;

	const mockExpense = {
		id: 'id',
		name: 'name',
		description: 'description',
		amount: 1,
		created: new Date('2024-05-01'),
		categoryInfo: {
			id: 'id',
			name: 'name',
			icon: 'icon',
		},
		eventInfo: {
			id: 'eventId',
			name: 'eventName',
			private: false,
		},
		payer: {
			id: 'id',
			username: 'username',
			guest: false,
			authenticated: true,
		},
	} as Expense;

	beforeEach(() => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				ExpenseService,
				{ provide: ENV, useValue: env },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});

		service = TestBed.inject(ExpenseService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	describe('#loadExpenses', () => {
		it('should load expenses', () => {
			service.loadExpenses('eventId').subscribe({
				next: (result) => {
					expect(result).toEqual([mockExpense]);
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses?eventId=eventId');

			expect(req.request.method).toEqual('GET');

			req.flush([mockExpense]);
		});
	});

	describe('#getExpense', () => {
		it('should get expense', () => {
			service.getExpense('id').subscribe({
				next: (result) => {
					expect(result).toEqual(mockExpense);
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses/id');

			expect(req.request.method).toEqual('GET');

			req.flush(mockExpense);
		});
	});

	describe('#createExpense', () => {
		it('should create expense', () => {
			service.createExpense('expenseName', 'expenseDescription', 1, 'categoryId', 'payerId', undefined).subscribe({
				next: (result) => {
					expect(result).toEqual(mockExpense);
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({
				name: 'expenseName',
				description: 'expenseDescription',
				amount: 1,
				categoryId: 'categoryId',
				payerId: 'payerId',
				expenseDate: undefined,
			});

			req.flush(mockExpense);
		});
	});

	describe('#editExpense', () => {
		it('should edit expense', () => {
			service.editExpense('expenseId', 'name', 'description', 1, 'categoryId', 'payerId', undefined).subscribe({
				next: (result) => {
					expect(result).toEqual(mockExpense);
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses/expenseId');

			expect(req.request.method).toEqual('PUT');
			expect(req.request.body).toEqual({
				name: 'name',
				description: 'description',
				amount: 1,
				categoryId: 'categoryId',
				payerId: 'payerId',
				expenseDate: undefined,
			});

			req.flush(mockExpense);
		});
	});

	describe('#deleteExpense', () => {
		it('should delete expense', () => {
			service.deleteExpense('expenseId').subscribe();

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses/expenseId');

			expect(req.request.method).toEqual('DELETE');

			req.flush(null);
		});
	});
});
