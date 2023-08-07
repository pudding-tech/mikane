import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockComponent, MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { spyPropertyGetter } from 'src/app/helpers/test.helpers';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { AccountComponent } from '../account/account.component';
import { EventsComponent } from '../events/events.component';
import { LoginComponent } from './login.component';

describe('Login Component', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let page: PageObject;
	let authService: jasmine.SpyObj<AuthService>;
	let messageService: jasmine.SpyObj<MessageService>;
	let breakpointService: jasmine.SpyObj<BreakpointService>;

	beforeEach(async () => {
		authService = jasmine.createSpyObj<AuthService>(
			'AuthService',
			['login', 'logout', 'sendResetPasswordEmail', 'getCurrentUser'],
			['redirectUrl']
		);
		messageService = jasmine.createSpyObj<MessageService>('MessageService', ['showSuccess', 'showError']);
		breakpointService = jasmine.createSpyObj<BreakpointService>('BreakpointService', ['isMobile']);

		TestBed.configureTestingModule({
			imports: [LoginComponent],
			providers: [
				{ provide: AuthService, useValue: authService },
				{ provide: MessageService, useValue: messageService },
				{ provide: BreakpointService, useValue: breakpointService },
				provideRouter([
					{ path: 'login', component: LoginComponent },
					{ path: 'events', component: MockComponent(EventsComponent) },
					{ path: 'account', component: MockComponent(AccountComponent) },
				]),
			],
		}).overrideComponent(LoginComponent, {
			remove: {
				imports: [
					MatFormFieldModule,
					MatInputModule,
					MatProgressSpinnerModule,
					MatButtonModule,
					MatToolbarModule,
					MatCardModule,
					MatIconModule,
				],
			},
			add: {
				imports: [
					MockModule(MatInputModule),
					MockModule(MatProgressSpinnerModule),
					MockModule(MatButtonModule),
					MockModule(MatToolbarModule),
					MockModule(MatCardModule),
					MockModule(MatIconModule),
				],
			},
		});
		await RouterTestingHarness.create('/login');

		fixture = TestBed.createComponent(LoginComponent);
		page = new PageObject(fixture);
		component = fixture.componentInstance;

		(fixture.debugElement.injector.get(BreakpointService) as jasmine.SpyObj<BreakpointService>).isMobile.and.returnValue(of(false));
		fixture.detectChanges();
	});

	it('should show login form', () => {
		component.breakpointService.isMobile().subscribe((isMobile) => {
			expect(isMobile).toBe(false);
		});
		expect(page.loginForm.nativeElement).toBeDefined();
		expect(page.mobileContent).toBeFalsy();
		expect(page.resetForm).toBeFalsy();
	});

	it('should login user', () => {
		authService.login.and.returnValue(of({} as User));
		messageService.showSuccess.and.stub();

		page.usernameInput.value = 'username';
		page.passwordInput.value = 'password';
		page.usernameInput.dispatchEvent(new Event('input'));
		page.passwordInput.dispatchEvent(new Event('input'));

		page.loginButton.nativeElement.click();
		fixture.detectChanges();
		expect(fixture.debugElement.injector.get(AuthService).login).toHaveBeenCalledOnceWith('username', 'password');
		expect(fixture.debugElement.injector.get(MessageService).showSuccess).toHaveBeenCalledOnceWith('Login successful');
		expect(fixture.debugElement.injector.get(MessageService).showError).not.toHaveBeenCalled();
	});

	it('should fail to login user if login info is wrong', () => {
		authService.login.and.returnValue(
			throwError(() => {
				return { error: { code: 'PUD-003' } } as ApiError;
			})
		);
		messageService.showError.and.stub();

		page.usernameInput.value = 'wrong username';
		page.passwordInput.value = 'wrong password';
		page.usernameInput.dispatchEvent(new Event('input'));
		page.passwordInput.dispatchEvent(new Event('input'));
		page.loginButton.nativeElement.click();
		fixture.detectChanges();

		expect(fixture.debugElement.injector.get(AuthService).login).toHaveBeenCalledOnceWith('wrong username', 'wrong password');
		expect(fixture.debugElement.injector.get(MessageService).showError).toHaveBeenCalledOnceWith('Wrong username or password');
		expect(fixture.debugElement.injector.get(MessageService).showSuccess).not.toHaveBeenCalled();
	});

	it('should show error if no user returned', () => {
		authService.login.and.returnValue(of(undefined));
		messageService.showError.and.stub();

		page.usernameInput.value = 'username';
		page.passwordInput.value = 'password';
		page.usernameInput.dispatchEvent(new Event('input'));
		page.passwordInput.dispatchEvent(new Event('input'));

		page.loginButton.nativeElement.click();
		fixture.detectChanges();

		expect(messageService.showError).toHaveBeenCalledOnceWith('Login failed');
	});

	it('should focus on username field if fields empty', () => {
		expect(page.focus).toBeFalsy();
		page.loginButton.nativeElement.click();
		fixture.detectChanges();

		expect(page.focus.nativeElement).toBe(page.usernameInput);
	});

	it('should redirect to events page after login', fakeAsync(() => {
		authService.login.and.returnValue(of({} as User));
		authService.getCurrentUser.and.returnValue(of({} as User));
		messageService.showSuccess.and.stub();

		page.usernameInput.value = 'username';
		page.passwordInput.value = 'password';
		page.usernameInput.dispatchEvent(new Event('input'));
		page.passwordInput.dispatchEvent(new Event('input'));

		page.loginButton.nativeElement.click();
		tick();
		fixture.detectChanges();

		expect(TestBed.inject(Router).url).toEqual('/events');
	}));

	it('should redirect to stored redirect url after login', fakeAsync(() => {
		authService.login.and.returnValue(of({} as User));
		spyPropertyGetter(authService, 'redirectUrl').and.returnValue('/account');

		page.usernameInput.value = 'username';
		page.passwordInput.value = 'password';
		page.usernameInput.dispatchEvent(new Event('input'));
		page.passwordInput.dispatchEvent(new Event('input'));

		page.loginButton.nativeElement.click();
		tick();
		fixture.detectChanges();

		expect(TestBed.inject(Router).url).toEqual('/account');
	}));

	it('should toggle forgot password view', () => {
		expect(page.loginForm).toBeDefined();
		expect(page.resetForm).toBeFalsy();
		expect(page.forgotPasswordButton.innerText).toBe('Forgot password?');

		page.forgotPasswordButton.click();
		fixture.detectChanges();

		expect(page.resetForm).toBeDefined();
		expect(page.loginForm).toBeFalsy();
		expect(page.forgotPasswordButton.innerText).toBe('Back');

		page.forgotPasswordButton.click();
		fixture.detectChanges();

		expect(page.loginForm).toBeDefined();
		expect(page.resetForm).toBeFalsy();
	});

	it('should request password reset', () => {
		authService.sendResetPasswordEmail.and.returnValue(of(undefined));
		page.forgotPasswordButton.click();
		fixture.detectChanges();
		expect(page.infoText).toBeFalsy();

		page.emailInput.value = 'email@email.com';
		page.emailInput.dispatchEvent(new Event('input'));

		page.passwordButton.click();
		fixture.detectChanges();
		expect(authService.sendResetPasswordEmail).toHaveBeenCalledOnceWith('email@email.com');
		expect(page.infoText).toBeDefined();
	});

	it('should show error response if request fails', () => {
		authService.sendResetPasswordEmail.and.returnValue(
			throwError(() => {
				return {
					status: 400,
				};
			})
		);

		page.forgotPasswordButton.click();
		fixture.detectChanges();
		expect(page.errorText).toBeFalsy();

		page.emailInput.value = 'email@email.com';
		page.emailInput.dispatchEvent(new Event('input'));

		page.passwordButton.click();
		fixture.detectChanges();
		expect(page.errorText).toBeDefined();
		expect(page.errorText.nativeElement.innerHTML).toContain('Server not configured for sending email');

		authService.sendResetPasswordEmail.and.returnValue(
			throwError(() => {
				return {
					status: 500,
				};
			})
		);

		page.emailInput.value = 'email@email.com';
		page.emailInput.dispatchEvent(new Event('input'));

		page.passwordButton.click();
		fixture.detectChanges();
		expect(page.errorText).toBeDefined();
		expect(page.errorText.nativeElement.innerText).toBe('Something went wrong while sending email :(');
	});

	it('should reset error text when toggling forgot password view', () => {
		authService.sendResetPasswordEmail.and.returnValue(
			throwError(() => {
				return {
					status: 400,
				};
			})
		);

		page.forgotPasswordButton.click();
		fixture.detectChanges();
		expect(page.errorText).toBeFalsy();

		page.emailInput.value = 'email@email.com';
		page.emailInput.dispatchEvent(new Event('input'));

		page.passwordButton.click();
		fixture.detectChanges();
		expect(page.errorText).toBeDefined();

		page.forgotPasswordButton.click();
		fixture.detectChanges();
		expect(page.errorText).toBeFalsy();
	});

	describe('on mobile', () => {
		beforeEach(() => {
			(fixture.debugElement.injector.get(BreakpointService) as jasmine.SpyObj<BreakpointService>).isMobile.and.returnValue(of(true));
			fixture.detectChanges();
		});

		it('should show mobile view', () => {
			expect(page.mobileContent).toBeDefined();
			expect(page.notMobileContent).toBeFalsy();
		});
	});
});

class PageObject {
	get focus() {
		return this.fixture.debugElement.query(By.css(':focus'));
	}

	get forgotPasswordText() {
		return this.fixture.debugElement.query(By.css('.forgot-password-text'));
	}

	get mobileContent() {
		return this.fixture.debugElement.query(By.css('.mobile-view'));
	}

	get notMobileContent() {
		return this.fixture.debugElement.query(By.css('.login-content'));
	}

	get loginForm() {
		return this.fixture.debugElement.query(By.css('#login-form'));
	}

	get usernameInput() {
		return this.fixture.debugElement.query(By.css('#username-input')).nativeElement as HTMLInputElement;
	}

	get passwordInput() {
		return this.fixture.debugElement.query(By.css('#password-input')).nativeElement as HTMLInputElement;
	}

	get emailInput() {
		return this.fixture.debugElement.query(By.css('#email-input')).nativeElement as HTMLInputElement;
	}

	get resetForm() {
		return this.fixture.debugElement.query(By.css('#reset-form'));
	}

	get loginButton() {
		return this.fixture.debugElement.query(By.css('#login-button'));
	}

	get passwordButton() {
		return this.fixture.debugElement.query(By.css('#password-button')).nativeElement as HTMLButtonElement;
	}

	get forgotPasswordButton() {
		return this.fixture.debugElement.query(By.css('.forgot-password-button')).nativeElement as HTMLButtonElement;
	}

	get infoText() {
		return this.fixture.debugElement.query(By.css('.info-text'));
	}

	get errorText() {
		return this.fixture.debugElement.query(By.css('.error-text'));
	}

	constructor(private fixture: ComponentFixture<LoginComponent>) {}
}
