import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { User } from '../user/user.service';
import { AuthService } from './auth.service';
import { loggedInGuard } from './logged-in.guard';

@Component({
	selector: 'app-mock-event',
	template: '',
	standalone: true,
})
class MockEventComponent {}
@Component({
	selector: 'app-mock-login',
	template: '',
	standalone: true,
})
class MockLoginComponent {}

describe('loggedInGuard', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => loggedInGuard(...guardParameters));
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
					{ path: 'events', component: MockEventComponent },
					{ path: 'login', canActivate: [executeGuard], component: MockLoginComponent },
				]),
			],
		});

		authService = TestBed.inject(AuthService);
	});

	it('should navigate to events page if logged in', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(of({ id: '1' } as User));
		await RouterTestingHarness.create('/login');

		expect(TestBed.inject(Router).url).toEqual('/events');
	});

	it('should activate if user does not exist', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(of(undefined));
		await RouterTestingHarness.create('/login');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});

	it('should activate if not authenticated', async () => {
		vi.spyOn(authService, 'getCurrentUser').mockReturnValue(throwError(() => new Error()));
		await RouterTestingHarness.create('/login');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});
});
