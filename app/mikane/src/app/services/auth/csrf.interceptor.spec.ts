import { HttpHandlerFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { MessageService } from '../message/message.service';
import { AuthService } from './auth.service';
import { csrfInterceptor } from './csrf.interceptor';

describe('csrfInterceptor', () => {
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
						csrfToken$: { getValue: vi.fn() },
						redirectUrl: '',
						clearCurrentUser: vi.fn(),
						logout: vi.fn().mockReturnValue(of(void 0)),
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
				provideHttpClient(withInterceptors([csrfInterceptor])),
				provideHttpClientTesting(),
			],
		});

		next = vi.fn() as HttpHandlerFn & Mock;

		executeHandler = (req: HttpRequest<unknown>, next: HttpHandlerFn & Mock) =>
			TestBed.runInInjectionContext(() => {
				return csrfInterceptor(req, next);
			});

		mockAuthService = TestBed.inject(AuthService);
		mockRouter = TestBed.inject(Router);
		mockMessageService = TestBed.inject(MessageService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should add X-XSRF-TOKEN header if csrfToken exists', () => {
		const csrfToken = 'test-token';
		(mockAuthService.csrfToken$.getValue as unknown as Mock).mockReturnValue(csrfToken);
		const req = new HttpRequest('POST', '/api/test', {});
		next.mockReturnValue(of(req));
		executeHandler(req, next).subscribe();

		expect(next).toHaveBeenCalledWith(
			expect.objectContaining({
				headers: expect.objectContaining({
					// The headers object is immutable, so we check for the header value
					get: expect.any(Function),
				}),
			}),
		);
		const calledReq = (next as Mock).mock.calls[0][0] as HttpRequest<unknown>;

		expect(calledReq.headers.get('X-XSRF-TOKEN')).toBe(csrfToken);
	});

	it('should not add X-XSRF-TOKEN header if csrfToken is falsy', () => {
		(mockAuthService.csrfToken$.getValue as unknown as Mock).mockReturnValue('');
		const req = new HttpRequest('POST', '/api/test', {});
		next.mockReturnValue(of(req));
		executeHandler(req, next).subscribe();

		const calledReq = (next as Mock).mock.calls[0][0] as HttpRequest<unknown>;

		expect(calledReq.headers.has('X-XSRF-TOKEN')).toBe(false);
	});

	it('should propagate error if not 403/PUD-148', () => {
		(mockAuthService.csrfToken$.getValue as unknown as Mock).mockReturnValue('token');
		const req = new HttpRequest('GET', '/api/test');
		const error = { status: 500, error: { code: 'OTHER' } };
		next.mockReturnValue(throwError(() => error));
		let thrown: unknown;
		executeHandler(req, next).subscribe({
			error: (e) => (thrown = e),
		});

		expect(thrown).toBe(error);
	});

	it('should handle 403 with code PUD-148: show error, clear user, redirect, never complete', () => {
		(mockAuthService.csrfToken$.getValue as unknown as Mock).mockReturnValue('token');
		const req = new HttpRequest('GET', '/api/test');
		const error = { status: 403, error: { code: 'PUD-148' } };
		next.mockReturnValue(throwError(() => error));
		let completed = false;
		executeHandler(req, next).subscribe({
			complete: () => (completed = true),
		});

		expect(mockMessageService.showError).toHaveBeenCalledWith('CSRF Token invalid, please log in again.');
		expect(mockAuthService.redirectUrl).toBe('/current-url');
		expect(mockAuthService.logout).toHaveBeenCalledWith();
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
		expect(completed).toBe(false); // NEVER does not complete
	});
});
