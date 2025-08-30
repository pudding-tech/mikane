import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { MessageService } from '../message/message.service';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
	let mockAuthService: AuthService;
	let mockRouter: Router;
	let mockMessageService: MessageService;
	let httpTestingController: HttpTestingController;
	let next: HttpHandlerFn & Mock;
	let executeHandler: (req: HttpRequest<unknown>, next: HttpHandlerFn & Mock) => Observable<unknown>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: AuthService,
					useValue: {
						redirectUrl: '',
						clearCurrentUser: vi.fn(),
					},
				},
				{
					provide: Router,
					useValue: {
						url: '/current-url',
						navigate: vi.fn(() => Promise.resolve(true)),
					},
				},
				{
					provide: MessageService,
					useValue: {
						showError: vi.fn(),
					},
				},
				provideHttpClient(withInterceptors([authInterceptor])),
				provideHttpClientTesting(),
			],
		});

		next = vi.fn() as HttpHandlerFn & Mock;

		executeHandler = (req: HttpRequest<unknown>, next: HttpHandlerFn & Mock) =>
			TestBed.runInInjectionContext(() => {
				return authInterceptor(req, next);
			});

		mockAuthService = TestBed.inject(AuthService);
		mockRouter = TestBed.inject(Router);
		mockMessageService = TestBed.inject(MessageService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should add withCredentials to the request', () => {
		const req = new HttpRequest('GET', '/api/test');
		next.mockReturnValue(of(req));
		executeHandler(req, next).subscribe();

		expect(next).toHaveBeenCalledWith(expect.objectContaining({ withCredentials: true }));
	});

	it('should propagate error for 401 with code PUD-000', async () => {
		const req = new HttpRequest('GET', '/api/test');
		const error = { status: 401, error: { code: 'PUD-000' } };
		next.mockReturnValue(throwError(() => error));
		let thrown: ApiError;
		executeHandler(req, next).subscribe({
			error: (e) => (thrown = e),
		});

		expect(thrown).toBe(error);
	});

	it('should redirect to login for 401 with code not PUD-003', () => {
		const req = new HttpRequest('GET', '/api/test');
		const error = { status: 401, error: { code: 'SOME-CODE' } };
		next.mockReturnValue(throwError(() => error));
		let completed = false;
		executeHandler(req, next).subscribe({
			complete: () => (completed = true),
		});

		expect(mockAuthService.redirectUrl).toBe('/current-url');
		expect(mockAuthService.clearCurrentUser).toHaveBeenCalledWith();
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
		expect(completed).toBe(false); // NEVER does not complete
	});

	it('should redirect to events and show error for 403 with code PUD-138', () => {
		const req = new HttpRequest('GET', '/api/test');
		const error = { status: 403, error: { code: 'PUD-138' } };
		next.mockReturnValue(throwError(() => error));
		let completed = false;
		executeHandler(req, next).subscribe({
			complete: () => (completed = true),
		});

		expect(mockMessageService.showError).toHaveBeenCalledWith('You are not authorized to view this private event');
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/events']);
		expect(completed).toBe(false); // NEVER does not complete
	});

	it('should propagate other errors', async () => {
		const req = new HttpRequest('GET', '/api/test');
		const error = { status: 500, error: { code: 'OTHER' } };
		next.mockReturnValue(throwError(() => error));
		let thrown: ApiError;
		executeHandler(req, next).subscribe({
			error: (e) => (thrown = e),
		});

		expect(thrown).toBe(error);
	});
});
