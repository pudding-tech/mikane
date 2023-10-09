import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { UserBalance } from '../user/user.service';
import { EventService, Payment, PuddingEvent, EventStatusType } from './event.service';

describe('EventService', () => {
	let service: EventService;
	let httpTestingController: HttpTestingController;
	const mockEvent = {
		id: 'id',
		name: 'name',
		description: 'description',
		created: new Date(),
		adminIds: ['id'],
		private: false,
		status: {
			id: EventStatusType.ACTIVE,
			name: 'Active',
		}
	} as PuddingEvent;
	const mockUserBalance = {
		user: {
			id: 'id',
			username: 'username',
			guest: false,
			authenticated: true,
		},
		expensesCount: 0,
		spending: 0,
		expenses: 0,
		balance: 0,
	} as UserBalance;
	const mockPayment = {
		sender: {
			id: 'id',
			username: 'username',
			guest: false,
			authenticated: true,
		},
		receiver: {
			id: 'id',
			username: 'username',
			guest: false,
			authenticated: true,
		},
		amount: 0,
	} as Payment;

	beforeEach(() => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
		TestBed.configureTestingModule({
			providers: [EventService, { provide: ENV, useValue: env }],
			imports: [HttpClientTestingModule],
		});
		service = TestBed.inject(EventService);

		// Inject the http service and test controller for each test
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	describe('#loadEvents', () => {
		it('should load events', () => {
			service.loadEvents().subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual([mockEvent]);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events');

			expect(req.request.method).toEqual('GET');

			req.flush([mockEvent]);
		});
	});

	describe('#loadBalances', () => {
		it('should load balances', () => {
			service.loadBalances('eventId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual([mockUserBalance]);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId/balances');

			expect(req.request.method).toEqual('GET');

			req.flush([mockUserBalance]);
		});
	});

	describe('#loadPayments', () => {
		it('should load payments', () => {
			service.loadPayments('eventId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual([mockPayment]);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId/payments');

			expect(req.request.method).toEqual('GET');

			req.flush([mockPayment]);
		});
	});

	describe('#getEvent', () => {
		it('should get event', () => {
			service.getEvent('eventId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId');

			expect(req.request.method).toEqual('GET');
		});
	});

	describe('#createEvent', () => {
		it('should create event', () => {
			service.createEvent({ name: 'name', description: 'description' }).subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({ name: 'name', description: 'description', private: false });

			req.flush(mockEvent);
		});
	});

	describe('#editEvent', () => {
		it('should edit event', () => {
			service.editEvent({ id: 'eventId', name: 'name', description: 'description', status: EventStatusType.ACTIVE }).subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId');

			expect(req.request.method).toEqual('PUT');
			expect(req.request.body).toEqual({ name: 'name', description: 'description', private: false, status: EventStatusType.ACTIVE });

			req.flush(mockEvent);
		});
	});

	describe('#deleteEvent', () => {
		it('should delete event', () => {
			service.deleteEvent('eventId').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId');

			expect(req.request.method).toEqual('DELETE');

			req.flush(null);
		});
	});

	describe('#addUser', () => {
		it('should add user', () => {
			service.addUser('eventId', 'userId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId/user/userId');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({});

			req.flush(mockEvent);
		});
	});

	describe('#removeUser', () => {
		it('should remove user', () => {
			service.removeUser('eventId', 'userId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId/user/userId');

			expect(req.request.method).toEqual('DELETE');

			req.flush(mockEvent);
		});
	});

	describe('#setUserAsAdmin', () => {
		it('should set user as admin', () => {
			service.setUserAsAdmin('eventId', 'userId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId/admin/userId');

			expect(req.request.method).toEqual('POST');

			req.flush(mockEvent);
		});
	});

	describe('#removeUserAsAdmin', () => {
		it('should remove user as admin', () => {
			service.removeUserAsAdmin('eventId', 'userId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual(mockEvent);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/events/eventId/admin/userId');

			expect(req.request.method).toEqual('DELETE');

			req.flush(mockEvent);
		});
	});
});
