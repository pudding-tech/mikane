import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { User } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
	let service: AuthService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				AuthService,
				{ provide: ENV, useValue: env },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		service = TestBed.inject(AuthService);

		// Inject the http service and test controller for each test
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should set and get redirectUrl', () => {
		const redirectUrl = 'http://example.com';
		service.redirectUrl = redirectUrl;

		expect(service.redirectUrl).toEqual(redirectUrl);
		expect(service.redirectUrl).toBe('undefined');
	});

	describe('#login', () => {
		let expectedLoginResponse: User;

		beforeEach(() => {
			expectedLoginResponse = {
				authenticated: true,
				id: '24b96dad-e95a-4794-9dea-25fd2bbd21a1',
				username: 'testuser',
				name: 'Test',
				firstName: 'Test',
				lastName: 'McTesty',
				email: 'test@user.com',
				created: new Date('2023-01-20T18:00:00'),
				guest: false,
				avatarURL: 'https://gravatar.com/avatar/aaaa',
			};
		});

		it('should return user after login', () => {
			service.login('testuser', 'secret').subscribe({
				next: (user) => {
					expect(user).withContext('should return user').toEqual(expectedLoginResponse);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/login');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({ usernameEmail: 'testuser', password: 'secret' });

			req.flush(expectedLoginResponse);
		});
	});

	describe('#logout', () => {
		it('should call logout', () => {
			service.logout().subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/logout');

			expect(req.request.method).toEqual('POST');

			req.flush({});
		});
	});

	describe('#sendResetPasswordEmail', () => {
		it('should send email', () => {
			service.sendResetPasswordEmail('test@test.test').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/requestpasswordreset');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({ email: 'test@test.test' });

			req.flush({});
		});
	});

	describe('#getCurrentUser', () => {
		let expectedLoginResponse: User;

		beforeEach(() => {
			expectedLoginResponse = {
				authenticated: true,
				id: '24b96dad-e95a-4794-9dea-25fd2bbd21a1',
				username: 'testuser',
				name: 'Test',
				firstName: 'Test',
				lastName: 'McTesty',
				email: 'test@user.com',
				created: new Date('2023-01-20T18:00:00'),
				guest: false,
				avatarURL: 'https://gravatar.com/avatar/aaaa',
			};
		});

		it('should return current user', () => {
			service.getCurrentUser().subscribe({
				next: (user) => {
					expect(user).withContext('should return user').toEqual(expectedLoginResponse);
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/login');

			expect(req.request.method).toEqual('GET');

			req.flush(expectedLoginResponse);
		});

		it('should return cached user when called multiple times', () => {
			service.getCurrentUser().subscribe();

			// Should only make one request
			const req = httpTestingController.expectOne('http://localhost:3002/api/login');

			expect(req.request.method).toEqual('GET');

			req.flush(expectedLoginResponse);

			// Should hit cache
			service.getCurrentUser().subscribe({
				next: (user) => {
					expect(user).withContext('should return cached user').toEqual(expectedLoginResponse);
				},
				error: fail,
			});
		});
	});

	describe('#resetPassword', () => {
		it('should make reset password request', () => {
			service.resetPassword('key', 'newsecret').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/resetpassword');

			expect(req.request.method).toEqual('POST');
			expect(req.request.body).toEqual({ key: 'key', password: 'newsecret' });

			req.flush({});
		});
	});

	describe('#clearCurrentUser', () => {
		let expectedLoginResponse: User;

		beforeEach(() => {
			expectedLoginResponse = {
				authenticated: true,
				id: '24b96dad-e95a-4794-9dea-25fd2bbd21a1',
				username: 'testuser',
				name: 'Test',
				firstName: 'Test',
				lastName: 'McTesty',
				email: 'test@user.com',
				created: new Date('2023-01-20T18:00:00'),
				guest: false,
				avatarURL: 'https://gravatar.com/avatar/aaaa',
			};
		});

		it('should clear current user', () => {
			service.getCurrentUser().subscribe({
				next: (user) => {
					expect(user).withContext('should return user').not.toBeNull();
				},
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/login');

			expect(req.request.method).toEqual('GET');

			req.flush(expectedLoginResponse);

			service.clearCurrentUser();

			service.getCurrentUser().subscribe({
				next: (user) => {
					expect(user).withContext('should return user').not.toBeNull();
				},
				error: fail,
			});

			const req2 = httpTestingController.expectOne('http://localhost:3002/api/login');

			expect(req2.request.method).toEqual('GET');

			req2.flush({});
		});
	});
});
