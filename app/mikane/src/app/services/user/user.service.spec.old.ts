import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { PuddingEvent } from '../event/event.service';
import { Expense } from '../expense/expense.service';
import { User, UserBalance, UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let httpMock: HttpTestingController;
	const apiUrl = 'http://localhost:3000/api/';
	const env = { apiUrl: apiUrl } as Environment;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				UserService,
				{ provide: ENV, useValue: env },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(UserService);
		httpMock = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('loadUsers', () => {
		it('should return an array of users', () => {
			const mockUsers: User[] = [
				{ id: '1', name: 'User 1' },
				{ id: '2', name: 'User 2' },
			] as User[];
			service.loadUsers().subscribe((users) => {
				expect(users).toEqual(mockUsers);
			});
			const req = httpMock.expectOne(apiUrl + 'users');

			expect(req.request.method).toBe('GET');
			req.flush(mockUsers);
		});

		it('should append excludeSelf query parameter when excludeSelf is true', () => {
			const mockUsers: User[] = [
				{ id: '1', name: 'User 1' },
				{ id: '2', name: 'User 2' },
			] as User[];
			service.loadUsers(true).subscribe((users) => {
				expect(users).toEqual(mockUsers);
			});
			const req = httpMock.expectOne(apiUrl + 'users?excludeSelf=true');

			expect(req.request.method).toBe('GET');
			req.flush(mockUsers);
		});
	});

	describe('loadUsersByEvent', () => {
		it('should return an array of users in provided event', () => {
			const mockUsers: User[] = [
				{ id: '1', name: 'User 1' },
				{ id: '2', name: 'User 2' },
			] as User[];
			const eventId = '123';
			service.loadUsersByEvent(eventId).subscribe((users) => {
				expect(users).toEqual(mockUsers);
			});
			const req = httpMock.expectOne(apiUrl + `users?eventId=${eventId}`);

			expect(req.request.method).toBe('GET');
			req.flush(mockUsers);
		});

		it('should append excludeGuests query parameter when excludeGuests is true', () => {
			const mockUsers: User[] = [
				{ id: '1', name: 'User 1' },
				{ id: '2', name: 'User 2' },
			] as User[];
			const eventId = '123';
			service.loadUsersByEvent(eventId, true).subscribe((users) => {
				expect(users).toEqual(mockUsers);
			});
			const req = httpMock.expectOne(apiUrl + `users?eventId=${eventId}&excludeGuests=true`);

			expect(req.request.method).toBe('GET');
			req.flush(mockUsers);
		});
	});

	describe('loadUserById', () => {
		it('should return a user', () => {
			const mockUser: User = { id: '1', name: 'User 1' } as User;
			const userId = '1';
			service.loadUserById(userId).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + `users/${userId}`);

			expect(req.request.method).toBe('GET');
			req.flush(mockUser);
		});
	});

	describe('loadUserByUsernameOrId', () => {
		it('should return a user by username', () => {
			const mockUser: User = { id: '1', username: 'user1', name: 'User 1' } as User;
			const username = 'user1';
			service.loadUserByUsernameOrId(username).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + `users/username/${username}`);

			expect(req.request.method).toBe('GET');
			req.flush(mockUser);
		});

		it('should return a user by ID', () => {
			const mockUser: User = { id: '1', username: 'user1', name: 'User 1' } as User;
			const userId = '1';
			service.loadUserByUsernameOrId(userId).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + `users/username/${userId}`);

			expect(req.request.method).toBe('GET');
			req.flush(mockUser);
		});
	});

	describe('createUser', () => {
		it('should create a user', () => {
			const mockUser: User = {
				id: '1',
				name: 'User 1',
				eventInfo: {
					id: '24b96dad-e95a-4794-9dea-25fd2bbd21a1',
					isAdmin: false,
					joinedTime: new Date(),
				},
				email: 'email',
			} as User;
			const eventId = '123';
			const name = 'User 1';
			service.createUser(eventId, name).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + 'users');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ name: name, eventId: eventId, email: 'email', password: 'password' });
			req.flush(mockUser);
		});
	});

	describe('loadUserEvents', () => {
		it('should return an array of events', () => {
			const mockEvents: PuddingEvent[] = [
				{ id: '1', name: 'Event 1' },
				{ id: '2', name: 'Event 2' },
			] as PuddingEvent[];
			const userId = '1';
			service.loadUserEvents(userId).subscribe((events) => {
				expect(events).toEqual(mockEvents);
			});
			const req = httpMock.expectOne(apiUrl + `users/${userId}/events`);

			expect(req.request.method).toBe('GET');
			req.flush(mockEvents);
		});
	});

	describe('loadUserExpenses', () => {
		it('should return an array of expenses', () => {
			const mockExpenses: Expense[] = [
				{ id: '1', name: 'Expense 1' },
				{ id: '2', name: 'Expense 2' },
			] as Expense[];
			const userId = '1';
			const eventId = '123';
			service.loadUserExpenses(userId, eventId).subscribe((expenses) => {
				expect(expenses).toEqual(mockExpenses);
			});
			const req = httpMock.expectOne(apiUrl + `users/${userId}/expenses?eventId=${eventId}`);

			expect(req.request.method).toBe('GET');
			req.flush(mockExpenses);
		});
	});

	describe('loadUserBalance', () => {
		it('should return an array of user balances', () => {
			const mockBalances: UserBalance[] = [
				{
					user: {
						id: '1',
						name: 'User 1',
					},
					balance: 10,
				},
				{
					user: {
						id: '2',
						name: 'User 2',
					},
					balance: -5,
				},
			] as UserBalance[];
			const eventId = '123';
			service.loadUserBalance(eventId).subscribe((balances) => {
				expect(balances).toEqual(mockBalances);
			});
			const req = httpMock.expectOne(apiUrl + `users/balances?eventId=${eventId}`);

			expect(req.request.method).toBe('GET');
			req.flush(mockBalances);
		});
	});

	describe('editUser', () => {
		it('should edit a user', () => {
			const mockUser: User = {
				id: '1',
				name: 'User 1',
				username: 'user1',
				firstName: 'First',
				lastName: 'Last',
				email: 'email',
				phone: '123',
			} as User;
			const userId = '1';
			const username = 'user1';
			const firstName = 'First';
			const lastName = 'Last';
			const email = 'email';
			const phone = '123';
			service.editUser(userId, username, firstName, lastName, email, phone).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + `users/${userId}`);

			expect(req.request.method).toBe('PUT');
			expect(req.request.body).toEqual({ username, firstName, lastName, email, phone });
			req.flush(mockUser);
		});
	});

	describe('deleteUser', () => {
		it('should delete a user', () => {
			const mockUsers: User[] = [{ id: '2', name: 'User 2' }] as User[];
			const userId = '1';
			const key = 'key';
			service.deleteUser(userId, key).subscribe((users) => {
				expect(users).toEqual(mockUsers);
			});
			const req = httpMock.expectOne(apiUrl + `users/${userId}`);

			expect(req.request.method).toBe('DELETE');
			expect(req.request.body).toEqual({ key });
			req.flush(mockUsers);
		});
	});

	describe('registerUser', () => {
		it('should register a user', () => {
			const mockUser: User = {
				id: '1',
				name: 'User 1',
				username: 'user1',
				firstName: 'First',
				lastName: 'Last',
				email: 'email',
				phone: '123',
			} as User;
			const username = 'user1';
			const firstName = 'First';
			const lastName = 'Last';
			const email = 'email';
			const phone = { number: '123' };
			const password = 'password';
			const key = 'key';
			service.registerUser(username, firstName, lastName, email, phone, password, key).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + 'users');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ username, firstName, lastName, email, phone: phone.number, password, key });
			req.flush(mockUser);
		});
	});

	describe('changeUserPassword', () => {
		it('should change a user password', () => {
			const mockUser: User = {
				id: '1',
				name: 'User 1',
				username: 'user1',
				firstName: 'First',
				lastName: 'Last',
				email: 'email',
				phone: '123',
			} as User;
			const currentPassword = 'current';
			const newPassword = 'new';
			service.changeUserPassword(currentPassword, newPassword).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(apiUrl + 'users/changepassword');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ currentPassword: currentPassword, newPassword: newPassword });
			req.flush(mockUser);
		});
	});

	describe('inviteUser', () => {
		it('should invite a user', () => {
			const email = 'email';
			const guestId = '123';
			service.inviteUser(email, guestId).subscribe((res) => {
				expect(res).toBeDefined();
			});
			const req = httpMock.expectOne(apiUrl + 'users/invite');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ email, guestId });
			req.flush({});
		});
	});

	describe('requestDeleteAccount', () => {
		it('should request to delete the user account', () => {
			service.requestDeleteAccount().subscribe((res) => {
				expect(res).toBeDefined();
			});
			const req = httpMock.expectOne(apiUrl + 'users/requestdeleteaccount');

			expect(req.request.method).toBe('POST');
			req.flush({});
		});
	});

	describe('loadGuestUsers', () => {
		it('should return an array of guest users', () => {
			const mockUsers: User[] = [
				{ id: '1', name: 'Guest 1' },
				{ id: '2', name: 'Guest 2' },
			] as User[];
			service.loadGuestUsers().subscribe((users) => {
				expect(users).toEqual(mockUsers);
			});
			const req = httpMock.expectOne(env.apiUrl + 'guests');

			expect(req.request.method).toBe('GET');
			req.flush(mockUsers);
		});
	});

	describe('createGuestUser', () => {
		it('should create a guest user', () => {
			const mockUser: User = { id: '1', name: 'Guest 1', firstName: 'First', lastName: 'Last' } as User;
			const firstName = 'First';
			const lastName = 'Last';
			service.createGuestUser(firstName, lastName).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(env.apiUrl + 'guests');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ firstName, lastName });
			req.flush(mockUser);
		});
	});

	describe('editGuestUser', () => {
		it('should edit a guest user', () => {
			const mockUser: User = { id: '1', name: 'Guest 1', firstName: 'First', lastName: 'Last' } as User;
			const id = '1';
			const firstName = 'First';
			const lastName = 'Last';
			service.editGuestUser(id, firstName, lastName).subscribe((user) => {
				expect(user).toEqual(mockUser);
			});
			const req = httpMock.expectOne(env.apiUrl + `guests/${id}`);

			expect(req.request.method).toBe('PUT');
			expect(req.request.body).toEqual({ firstName, lastName });
			req.flush(mockUser);
		});
	});

	describe('deleteGuestUser', () => {
		it('should delete a guest user', () => {
			const id = '1';
			service.deleteGuestUser(id).subscribe((res) => {
				expect(res).toBeDefined();
			});
			const req = httpMock.expectOne(env.apiUrl + `guests/${id}`);

			expect(req.request.method).toBe('DELETE');
			req.flush({});
		});
	});
});
