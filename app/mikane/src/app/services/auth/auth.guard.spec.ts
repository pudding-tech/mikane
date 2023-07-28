import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, provideRouter } from '@angular/router';

import { RouterTestingHarness } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { EventComponent } from 'src/app/pages/events/event/event.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { User } from '../user/user.service';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => authGuard(...guardParameters));
	let authService: jasmine.SpyObj<AuthService>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['redirectUrl', 'getCurrentUser']) },
				provideRouter([
					{ path: 'events', canActivate: [executeGuard], component: MockComponent(EventComponent) },
					{ path: 'login', component: MockComponent(LoginComponent) },
				]),
			],
		});

		authService = TestBed.inject<AuthService>(AuthService) as jasmine.SpyObj<AuthService>;
	});

	it('should redirect if user does not exist', async () => {
		authService.getCurrentUser.and.returnValue(of(undefined));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});

	it('should activate if user exists', async () => {
		authService.getCurrentUser.and.returnValue(of({ id: '1' } as User));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/events');
	});

	it('should redirect if not authenticated', async () => {
		authService.getCurrentUser.and.returnValue(throwError(() => new Error()));
		await RouterTestingHarness.create('/events');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});

	it('should store url for redirect before navigating', async () => {
		authService.getCurrentUser.and.returnValue(throwError(() => new Error()));
		await RouterTestingHarness.create('/events');

		expect(authService.redirectUrl).toBe('/events');
	});
});
