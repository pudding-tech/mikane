import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { User } from '../user/user.service';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Component({ selector: 'app-mock-event', template: '', standalone: true })
class MockEventComponent {}
@Component({ selector: 'app-mock-login', template: '', standalone: true })
class MockLoginComponent {}

describe('AuthGuard', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => authGuard(...guardParameters));
	let authService: AuthService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: AuthService,
					useValue: {
						redirectUrl: vi.fn(),
						getCurrentUser: vi.fn(),
					},
				},
				provideRouter([
					{ path: 'events', canActivate: [executeGuard], component: MockEventComponent },
					{ path: 'login', component: MockLoginComponent },
				]),
			],
		});

		authService = TestBed.inject(AuthService);
	});

	it('should redirect if user does not exist', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(of(undefined));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});

	it('should activate if user exists', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(of({ id: '1' } as User));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/events');
	});

	it('should redirect if not authenticated', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(throwError(() => new Error()));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});

	it('should store url for redirect before navigating', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(throwError(() => new Error()));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/login');
		expect(authService.redirectUrl).toEqual('/events');
	});
});
