import { TestBed, fakeAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { DefaultRenderComponent, MockBuilder, MockInstance, MockRender, MockedComponentFixture, ngMocks } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { KeyValidationService } from 'src/app/services/key-validation/key-validation.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ResetPasswordComponent } from './reset-password.component';

describe('ResetPasswordComponent', () => {
	let component: DefaultRenderComponent<ResetPasswordComponent>;
	let fixture: MockedComponentFixture<ResetPasswordComponent>;
	let page: PageObject;
	let spy: jasmine.Spy;

	beforeAll(MockInstance.remember);

	afterAll(MockInstance.restore);

	beforeEach(() => {
		return MockBuilder(ResetPasswordComponent)
			.keep(FormsModule)
			.keep(ReactiveFormsModule)
			.mock(AuthService)
			.provide({
				provide: Router,
				useValue: {
					navigate: jasmine.createSpy('navigate'),
				},
			})
			.provide({
				provide: KeyValidationService,
				useValue: {
					verifyPasswordReset: jasmine.createSpy('verifyPasswordReset').and.returnValue(of(undefined)),
				},
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: jasmine.createSpy('showError'),
					showSuccess: jasmine.createSpy('showSuccess'),
				},
			})
			.mock(BreakpointService)
			.provide({
				provide: ActivatedRoute,
				useValue: {
					snapshot: {
						paramMap: convertToParamMap({
							key: 'key',
						}),
					},
				},
			});
	});

	beforeEach(fakeAsync(() => {
		fixture = MockRender(ResetPasswordComponent);
		component = fixture.componentInstance;

		const authService = TestBed.inject(AuthService);
		spy = spyOn(authService, 'resetPassword').and.returnValue(of(undefined));

		page = new PageObject(fixture);

		fixture.detectChanges();
	}));

	afterEach(() => {
		fixture.destroy();
	});

	it('should create', () => {
		expect(component).withContext('should create').toBeTruthy();
	});

	it('should render form', () => {
		expect(page.submitButton).withContext('should render submit button').toBeTruthy();
		expect(page.passwordField).withContext('should render password field').toBeTruthy();
		expect(page.confirmPasswordField).withContext('should render confirm password field').toBeTruthy();
	});

	it('should have a form', () => {
		expect(component.resetPasswordForm).withContext('should have a form').toBeTruthy();
	});

	it('should have a password control', () => {
		expect(component.resetPasswordForm.get('newPassword')).withContext('should have a password control').toBeTruthy();
	});

	it('should have a password confirmation control', () => {
		expect(component.resetPasswordForm.get('newPasswordRetype'))
			.withContext('should have a password confirmation control')
			.toBeTruthy();
	});

	it('should have a submit button', () => {
		const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));

		expect(submitButton).withContext('should have a submit button').toBeTruthy();
	});

	it('should reset password', () => {
		component.resetPasswordForm.setValue({
			newPassword: 'password',
			newPasswordRetype: 'password',
		});
		component.submit();

		expect(spy).toHaveBeenCalledWith('key', 'password');
	});

	it('should not reset password if passwords do not match', () => {
		component.resetPasswordForm.setValue({
			newPassword: 'password',
			newPasswordRetype: 'password2',
		});
		component.submit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('should not reset password if form is invalid', () => {
		component.resetPasswordForm.setValue({
			newPassword: '',
			newPasswordRetype: '',
		});
		component.submit();

		expect(spy).not.toHaveBeenCalled();
	});

	it('should fill out form and submit', () => {
		page.passwordField.nativeElement.value = 'password';
		page.passwordField.nativeElement.dispatchEvent(new Event('input'));
		page.confirmPasswordField.nativeElement.value = 'password';
		page.confirmPasswordField.nativeElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		page.submitButton.nativeElement.click();

		expect(spy).toHaveBeenCalledWith('key', 'password');
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
		const messageService = TestBed.inject(MessageService);
		spy.and.returnValue(
			throwError(() => {
				return {
					error: {
						message: 'error',
					},
				} as ApiError;
			})
		);
		page.passwordField.nativeElement.value = 'password';
		page.passwordField.nativeElement.dispatchEvent(new Event('input'));
		page.confirmPasswordField.nativeElement.value = 'password';
		page.confirmPasswordField.nativeElement.dispatchEvent(new Event('input'));
		fixture.detectChanges();

		page.submitButton.nativeElement.click();
		fixture.detectChanges();

		expect(messageService.showError).toHaveBeenCalledWith('Failed to change password');
	});

	it('should show error if key is invalid', () => {
		const messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
		const keyValidationService = TestBed.inject(KeyValidationService) as jasmine.SpyObj<KeyValidationService>;
		keyValidationService.verifyPasswordReset.and.returnValue(
			throwError(() => {
				return {
					error: {
						message: 'error',
					},
				} as ApiError;
			})
		);

		ngMocks.flushTestBed();

		MockRender(ResetPasswordComponent);
		fixture.detectChanges();

		expect(messageService.showError).toHaveBeenCalledWith('Failed to verify key');
	});

	it('should show error if key not found', () => {
		const messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
		const keyValidationService = TestBed.inject(KeyValidationService) as jasmine.SpyObj<KeyValidationService>;
		keyValidationService.verifyPasswordReset.and.returnValue(
			throwError(() => {
				return {
					status: 404,
				} as ApiError;
			})
		);

		ngMocks.flushTestBed();

		MockRender(ResetPasswordComponent);
		fixture.detectChanges();

		expect(messageService.showError).toHaveBeenCalledWith('Invalid key');
	});

	it('should redirect to login if key is invalid', () => {
		const router = TestBed.inject(Router);
		const keyValidationService = TestBed.inject(KeyValidationService) as jasmine.SpyObj<KeyValidationService>;
		keyValidationService.verifyPasswordReset.and.returnValue(
			throwError(() => {
				return {
					status: 404,
				} as ApiError;
			})
		);

		ngMocks.flushTestBed();

		MockRender(ResetPasswordComponent);
		fixture.detectChanges();

		expect(router.navigate).toHaveBeenCalledWith(['/login']);
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

	constructor(private fixture: MockedComponentFixture<ResetPasswordComponent>) {}
}
