import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, provideRouter } from '@angular/router';

import { RouterTestingHarness } from '@angular/router/testing';
import { MockComponent } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { EventComponent } from 'src/app/pages/events/event/event.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { User } from '../user/user.service';
import { AuthService } from './auth.service';
import { loggedInGuard } from './logged-in.guard';

describe('loggedInGuard', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => loggedInGuard(...guardParameters));
	let authService: jasmine.SpyObj<AuthService>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['redirectUrl', 'getCurrentUser']) },
				provideRouter([
					{ path: 'events', component: MockComponent(EventComponent) },
					{ path: 'login', canActivate: [executeGuard], component: MockComponent(LoginComponent) },
				]),
			],
		});

		authService = TestBed.inject<AuthService>(AuthService) as jasmine.SpyObj<AuthService>;
	});

	it('should navigate to events page if logged in', async () => {
		authService.getCurrentUser.and.returnValue(of({ id: '1' } as User));
		await RouterTestingHarness.create('/login');

		expect(TestBed.inject(Router).url).toEqual('/events');
	});

	it('should activate if user does not exist', async () => {
		authService.getCurrentUser.and.returnValue(of(undefined));
		await RouterTestingHarness.create('/login');

		expect(TestBed.inject(Router).url).toEqual('/login');
	});

	it('should activate if not authenticated', async () => {
		authService.getCurrentUser.and.returnValue(throwError(() => new Error()));
		await RouterTestingHarness.create('/login');

		expect(TestBed.inject(Router).url).toBe('/login');
	});
});
