import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginComponent } from './login.component';

@Component({ selector: 'app-events', template: '' })
class MockEventsComponent {}

@Component({ selector: 'app-account', template: '' })
class MockAccountComponent {}

describe('Login Component', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let page: PageObject;

	let authService: {
		login: ReturnType<typeof vi.fn>;
		logout: ReturnType<typeof vi.fn>;
		sendResetPasswordEmail: ReturnType<typeof vi.fn>;
		getCurrentUser: ReturnType<typeof vi.fn>;
		redirectUrl: string | null;
	};
	let messageService: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };
	let breakpointService: { isMobile: ReturnType<typeof vi.fn> };

	describe('', () => {
		beforeEach(async () => {
			authService = { login: vi.fn(), logout: vi.fn(), sendResetPasswordEmail: vi.fn(), getCurrentUser: vi.fn(), redirectUrl: null };
			messageService = { showSuccess: vi.fn(), showError: vi.fn() };
			breakpointService = { isMobile: vi.fn() };

			TestBed.configureTestingModule({
				imports: [
					LoginComponent,
					MatFormFieldModule,
					MatInputModule,
					MatProgressSpinnerModule,
					MatButtonModule,
					MatToolbarModule,
					MatCardModule,
					MatIconModule,
				],
				providers: [
					{ provide: AuthService, useValue: authService },
					{ provide: MessageService, useValue: messageService },
					{ provide: BreakpointService, useValue: breakpointService },
					{ provide: LogService, useValue: { log: vi.fn(), error: vi.fn() } },
					provideRouter([
						{ path: 'login', loadComponent: () => import('./login.component').then((m) => m.LoginComponent) },
						{ path: 'events', component: MockEventsComponent },
						{ path: 'account', component: MockAccountComponent },
					]),
					provideZonelessChangeDetection(),
				],
			}).compileComponents();

			fixture = TestBed.createComponent(LoginComponent);
			component = fixture.componentInstance;
			page = new PageObject(fixture);

			breakpointService.isMobile.mockReturnValue(of(false));
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
			authService.login.mockReturnValue(of({} as User));

			page.usernameInput.value = 'username';
			page.passwordInput.value = 'password';
			page.usernameInput.dispatchEvent(new Event('input'));
			page.passwordInput.dispatchEvent(new Event('input'));

			page.loginButton.nativeElement.click();
			fixture.detectChanges();

			expect(authService.login).toHaveBeenCalledWith('username', 'password');
			expect(messageService.showSuccess).toHaveBeenCalledWith('Login successful');
			expect(messageService.showError).not.toHaveBeenCalled();
		});

		it('should fail to login user if login info is wrong', () => {
			authService.login.mockReturnValue(
				throwError(() => {
					return { error: { code: 'PUD-003' } } as ApiError;
				}),
			);

			page.usernameInput.value = 'wrong username';
			page.passwordInput.value = 'wrong password';
			page.usernameInput.dispatchEvent(new Event('input'));
			page.passwordInput.dispatchEvent(new Event('input'));
			page.loginButton.nativeElement.click();
			fixture.detectChanges();

			expect(authService.login).toHaveBeenCalledWith('wrong username', 'wrong password');
			expect(messageService.showError).toHaveBeenCalledWith('Wrong username or password');
			expect(messageService.showSuccess).not.toHaveBeenCalled();
		});

		it('should show error if no user returned', () => {
			authService.login.mockReturnValue(of(undefined));

			page.usernameInput.value = 'username';
			page.passwordInput.value = 'password';
			page.usernameInput.dispatchEvent(new Event('input'));
			page.passwordInput.dispatchEvent(new Event('input'));

			page.loginButton.nativeElement.click();
			fixture.detectChanges();

			expect(messageService.showError).toHaveBeenCalledWith('Login failed');
		});

		it('should focus on username field if fields empty', () => {
			expect(page.focus).toBeFalsy();
			page.loginButton.nativeElement.click();
			fixture.detectChanges();

			expect(page.focus.nativeElement).toBe(page.usernameInput);
		});

		it('should redirect to events page after login', async () => {
			authService.login.mockReturnValue(of({} as User));
			authService.getCurrentUser.mockReturnValue(of({} as User));

			page.usernameInput.value = 'username';
			page.passwordInput.value = 'password';
			page.usernameInput.dispatchEvent(new Event('input'));
			page.passwordInput.dispatchEvent(new Event('input'));

			page.loginButton.nativeElement.click();
			await fixture.whenStable();

			expect(TestBed.inject(Router).url).toEqual('/events');
		});

		it('should redirect to stored redirect url after login', async () => {
			authService.login.mockReturnValue(of({} as User));
			Object.defineProperty(authService, 'redirectUrl', {
				get: () => '/account',
				set: vi.fn(),
			});

			page.usernameInput.value = 'username';
			page.passwordInput.value = 'password';
			page.usernameInput.dispatchEvent(new Event('input'));
			page.passwordInput.dispatchEvent(new Event('input'));

			page.loginButton.nativeElement.click();
			await fixture.whenStable();

			expect(TestBed.inject(Router).url).toEqual('/account');
		});

		it('should toggle forgot password view', () => {
			expect(page.loginForm).toBeDefined();
			expect(page.resetForm).toBeFalsy();
			expect(page.forgotPasswordButton.textContent).toBe('Forgot password?');

			page.forgotPasswordButton.click();
			fixture.detectChanges();

			expect(page.resetForm).toBeDefined();
			expect(page.loginForm).toBeFalsy();
			expect(page.forgotPasswordButton.textContent).toBe('Back');

			page.forgotPasswordButton.click();
			fixture.detectChanges();

			expect(page.loginForm).toBeDefined();
			expect(page.resetForm).toBeFalsy();
		});

		it('should request password reset', () => {
			authService.sendResetPasswordEmail.mockReturnValue(of(undefined));
			page.forgotPasswordButton.click();
			fixture.detectChanges();

			expect(page.infoText).toBeFalsy();

			page.emailInput.value = 'email@email.com';
			page.emailInput.dispatchEvent(new Event('input'));

			page.passwordButton.click();
			fixture.detectChanges();

			expect(authService.sendResetPasswordEmail).toHaveBeenCalledWith('email@email.com');
			expect(page.infoText).toBeDefined();
		});

		it('should show error response if request fails', () => {
			authService.sendResetPasswordEmail.mockReturnValue(
				throwError(() => {
					return {
						status: 400,
					};
				}),
			);

			page.forgotPasswordButton.click();
			fixture.detectChanges();

			expect(page.errorText).toBeFalsy();

			page.emailInput.value = 'email@email.com';
			page.emailInput.dispatchEvent(new Event('input'));

			page.passwordButton.click();
			fixture.detectChanges();

			expect(page.errorText).toBeDefined();
			expect(page.errorText.nativeElement.textContent).toContain('Server not configured for sending email');

			authService.sendResetPasswordEmail.mockReturnValue(
				throwError(() => {
					return {
						status: 500,
					};
				}),
			);

			page.emailInput.value = 'email@email.com';
			page.emailInput.dispatchEvent(new Event('input'));

			page.passwordButton.click();
			fixture.detectChanges();

			expect(page.errorText).toBeDefined();
			expect(page.errorText.nativeElement.textContent.trim()).toBe('Something went wrong while sending email :(');
		});

		it('should reset error text when toggling forgot password view', () => {
			authService.sendResetPasswordEmail.mockReturnValue(
				throwError(() => {
					return {
						status: 400,
					};
				}),
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
	});

	describe('on mobile', () => {
		beforeEach(async () => {
			authService = { login: vi.fn(), logout: vi.fn(), sendResetPasswordEmail: vi.fn(), getCurrentUser: vi.fn(), redirectUrl: null };
			messageService = { showSuccess: vi.fn(), showError: vi.fn() };
			breakpointService = { isMobile: vi.fn() };

			TestBed.configureTestingModule({
				imports: [
					LoginComponent,
					MatFormFieldModule,
					MatInputModule,
					MatProgressSpinnerModule,
					MatButtonModule,
					MatToolbarModule,
					MatCardModule,
					MatIconModule,
				],
				providers: [
					{ provide: AuthService, useValue: authService },
					{ provide: MessageService, useValue: messageService },
					{ provide: BreakpointService, useValue: breakpointService },
					{ provide: LogService, useValue: { log: vi.fn(), error: vi.fn() } },
					provideRouter([
						{ path: 'login', loadComponent: () => import('./login.component').then((m) => m.LoginComponent) },
						{ path: 'events', component: MockEventsComponent },
						{ path: 'account', component: MockAccountComponent },
					]),
				],
			}).compileComponents();

			fixture = TestBed.createComponent(LoginComponent);
			component = fixture.componentInstance;
			page = new PageObject(fixture);

			breakpointService.isMobile.mockReturnValue(of(true));
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
