import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { KeyValidationService } from 'src/app/services/key-validation/key-validation.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
	let component: ResetPasswordComponent;
	let fixture: ComponentFixture<ResetPasswordComponent>;
	let page: PageObject;

	const routerSpy = {
		navigate: vi.fn()
	};
	const authServiceSpy = {
		resetPassword: vi.fn(),
	};
	const keyValidationServiceSpy = {
		verifyPasswordReset: vi.fn(() => of(undefined)),
	};
	const messageServiceSpy = {
		showError: vi.fn(),
		showSuccess: vi.fn(),
	};
	const breakpointServiceSpy = {
		isMobile: () => false
	};
	const logServiceSpy = {};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, ReactiveFormsModule, ResetPasswordComponent],
			providers: [
				{ provide: Router, useValue: routerSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: KeyValidationService, useValue: keyValidationServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: BreakpointService, useValue: breakpointServiceSpy },
				{ provide: LogService, useValue: logServiceSpy },
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							paramMap: convertToParamMap({ key: 'key' }),
						},
					},
				},
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ResetPasswordComponent);
		component = fixture.componentInstance;
		page = new PageObject(fixture);

		vi.clearAllMocks();

		// Default spy return value
		authServiceSpy.resetPassword.mockReturnValue(of(undefined));
		keyValidationServiceSpy.verifyPasswordReset.mockReturnValue(of(undefined));
		routerSpy.navigate.mockClear();
		messageServiceSpy.showError.mockClear();
		messageServiceSpy.showSuccess.mockClear();

		fixture.detectChanges();
	});

	afterEach(() => {
		fixture.destroy();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should render form', () => {
		expect(page.submitButton).toBeTruthy();
		expect(page.passwordField).toBeTruthy();
		expect(page.confirmPasswordField).toBeTruthy();
	});

	it('should have a form', () => {
		expect(component.resetPasswordForm).toBeTruthy();
	});

	it('should have a password control', () => {
		expect(component.resetPasswordForm.get('newPassword')).toBeTruthy();
	});

	it('should have a password confirmation control', () => {
		expect(component.resetPasswordForm.get('newPasswordRetype')).toBeTruthy();
	});

	it('should have a submit button', () => {
		const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));

		expect(submitButton).toBeTruthy();
	});

	it('should reset password', () => {
		component.resetPasswordForm.setValue({
			newPassword: 'password',
			newPasswordRetype: 'password',
		});
		component.submit();

		expect(authServiceSpy.resetPassword).toHaveBeenCalledWith('key', 'password');
	});

	it('should not reset password if passwords do not match', () => {
		component.resetPasswordForm.setValue({
			newPassword: 'password',
			newPasswordRetype: 'password2',
		});
		component.submit();

		expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
	});

	it('should not reset password if form is invalid', () => {
		component.resetPasswordForm.setValue({
			newPassword: '',
			newPasswordRetype: '',
		});
		component.submit();

		expect(authServiceSpy.resetPassword).not.toHaveBeenCalled();
	});

	it('should fill out form and submit', () => {
		page.passwordField.nativeElement.value = 'password';
		page.passwordField.nativeElement.dispatchEvent(new Event('input'));
		page.confirmPasswordField.nativeElement.value = 'password';
		page.confirmPasswordField.nativeElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		page.submitButton.nativeElement.click();

		expect(authServiceSpy.resetPassword).toHaveBeenCalledWith('key', 'password');
	});

	it('should show success message after submitting', () => {
		const messageService = TestBed.inject(MessageService);
		page.passwordField.nativeElement.value = 'password';
		page.passwordField.nativeElement.dispatchEvent(new Event('input'));
		page.confirmPasswordField.nativeElement.value = 'password';
		page.confirmPasswordField.nativeElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		page.submitButton.nativeElement.click();
		fixture.detectChanges();

		expect(messageService.showSuccess).toHaveBeenCalledWith('Password changed successfully');
	});

	it('should redirect to login after submitting', () => {
		const router = TestBed.inject(Router);
		page.passwordField.nativeElement.value = 'password';
		page.passwordField.nativeElement.dispatchEvent(new Event('input'));
		page.confirmPasswordField.nativeElement.value = 'password';
		page.confirmPasswordField.nativeElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		page.submitButton.nativeElement.click();
		fixture.detectChanges();

		expect(router.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('should show error message after submitting', () => {
		authServiceSpy.resetPassword.mockReturnValue(
			throwError(() => {
				return {
					error: {
						message: 'error',
					},
				} as ApiError;
			}),
		);
		page.passwordField.nativeElement.value = 'password';
		page.passwordField.nativeElement.dispatchEvent(new Event('input'));
		page.confirmPasswordField.nativeElement.value = 'password';
		page.confirmPasswordField.nativeElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		page.submitButton.nativeElement.click();
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change password');
	});

	it('should show error if key is invalid', () => {
		keyValidationServiceSpy.verifyPasswordReset.mockReturnValue(
			throwError(() => {
				return {
					error: {
						message: 'error',
					},
				} as ApiError;
			}),
		);

		fixture = TestBed.createComponent(ResetPasswordComponent);
		component = fixture.componentInstance;
		page = new PageObject(fixture);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to verify key');
	});

	it('should show error if key not found', () => {
		keyValidationServiceSpy.verifyPasswordReset.mockReturnValue(
			throwError(() => {
				return {
					status: 404,
				} as ApiError;
			}),
		);

		fixture = TestBed.createComponent(ResetPasswordComponent);
		component = fixture.componentInstance;
		page = new PageObject(fixture);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Invalid key');
	});

	it('should redirect to login if key is invalid', () => {
		keyValidationServiceSpy.verifyPasswordReset.mockReturnValue(
			throwError(() => {
				return {
					status: 404,
				} as ApiError;
			}),
		);

		fixture = TestBed.createComponent(ResetPasswordComponent);
		component = fixture.componentInstance;
		page = new PageObject(fixture);
		fixture.detectChanges();

		expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
	});
});

class PageObject {
	get submitButton() {
		return this.fixture.debugElement.query(By.css('button.reset-password-button'));
	}
	get passwordField() {
		return this.fixture.debugElement.query(By.css('input[formControlName="newPassword"]'));
	}
	get confirmPasswordField() {
		return this.fixture.debugElement.query(By.css('input[formControlName="newPasswordRetype"]'));
	}
	get form() {
		return this.fixture.debugElement.query(By.css('form'));
	}

	constructor(private fixture: ComponentFixture<ResetPasswordComponent>) {}
}
