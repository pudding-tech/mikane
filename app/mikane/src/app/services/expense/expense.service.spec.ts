import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { FormValidationService } from '../form-validation/form-validation.service';
import { Expense, ExpenseService } from './expense.service';

describe('ExpenseService', () => {
	let service: ExpenseService;
	let httpTestingController: HttpTestingController;
	const mockExpense = {
		id: 'id',
		name: 'name',
		description: 'description',
		amount: 1,
		created: 1,
		categoryInfo: {
			id: 'id',
			name: 'name',
			icon: 'icon',
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
			providers: [FormValidationService, { provide: ENV, useValue: env }],
			imports: [HttpClientTestingModule],
		});
		service = TestBed.inject(ExpenseService);

		// Inject the http service and test controller for each test
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	describe('#loadExpenses', () => {
		it('should load expenses', () => {
			service.loadExpenses('eventId').subscribe({
				next: (result) =>

    expect(result).withContext('should return result').toEqual([mockExpense]),
				error: fail,
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
					expect(result).withContext('should return result').toEqual(mockExpense);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses/id');

			expect(req.request.method).toEqual('GET');

			req.flush(mockExpense);
		});
	});

	describe('#createExpense', () => {
		it('should create expense', () => {
			service.createExpense('expenseName', 'expenseDescription', 1, 'categoryId', 'payerId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockExpense);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({
				name: 'expenseName',
				description: 'expenseDescription',
				amount: 1,
				categoryId: 'categoryId',
				payerId: 'payerId',
			});

			req.flush(mockExpense);
		});
	});

	describe('#editExpense', () => {
		it('should edit expense', () => {
			service.editExpense('expenseId', 'name', 'description', 1, 'categoryId', 'payerId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockExpense);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses/expenseId');

			expect(req.request.method).toEqual('PUT');
			expect(req.request.body).toEqual({
				name: 'name',
				description: 'description',
				amount: 1,
				categoryId: 'categoryId',
				payerId: 'payerId',
			});

			req.flush(mockExpense);
		});
	});

	describe('#deleteExpense', () => {
		it('should delete expense', () => {
			service.deleteExpense('expenseId').subscribe({
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/expenses/expenseId');

			expect(req.request.method).toEqual('DELETE');

			req.flush(null);
		});
	});
});
