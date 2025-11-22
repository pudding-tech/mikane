import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { Phonenumber } from 'src/app/types/phonenumber.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterUserComponent } from './register-user.component';

class RUC extends RegisterUserComponent {
	public override key: string;
	public override guestRegistration: boolean;
}

describe('RegisterUserComponent', () => {
	let fixture: ComponentFixture<RegisterUserComponent>;
	let component: RegisterUserComponent;
	const alwaysValidAsyncValidator = () => of(null);

	let userServiceSpy: { registerUser: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let routerSpy: { navigate: ReturnType<typeof vi.fn> };
	let activatedRouteSpy: { data: Observable<{ res: { key: string; user: typeof mockUser } }> };

	const mockUser = {
		id: 'u1',
		name: 'Test User',
		firstName: 'Test',
		lastName: 'User',
		email: 'test@example.com',
	};

	function fillForm() {
		component.registerUserForm.setValue({
			username: 'testuser',
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			phone: '12345678',
			passwordGroup: {
				password: 'abc123',
				passwordRetype: 'abc123',
			},
		});
		(component as RUC).key = 'abc123';
		(component as unknown as { phone: Phonenumber }).phone = { number: '12345678' };
	}

	beforeEach(() => {
		userServiceSpy = { registerUser: vi.fn() };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
		routerSpy = { navigate: vi.fn() };
		activatedRouteSpy = { data: of({ res: { key: 'abc123', user: mockUser } }) };

		TestBed.configureTestingModule({
			imports: [RegisterUserComponent],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: BreakpointService, useValue: { isMobile: vi.fn(() => of(false)) } },
				{ provide: ActivatedRoute, useValue: activatedRouteSpy },
				{ provide: FormValidationService, useValue: {} },
				provideZonelessChangeDetection(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(RegisterUserComponent);
		component = fixture.componentInstance;

		component.registerUserForm.get('username')?.setAsyncValidators(alwaysValidAsyncValidator);
		component.registerUserForm.get('email')?.setAsyncValidators(alwaysValidAsyncValidator);
		component.registerUserForm.get('phone')?.setAsyncValidators(alwaysValidAsyncValidator);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should prefill form with route data', () => {
		expect((component as RUC).key).toBe('abc123');
		expect(component.registerUserForm.get('email')?.value).toBe('test@example.com');
		expect(component.registerUserForm.get('firstName')?.value).toBe('Test');
		expect(component.registerUserForm.get('lastName')?.value).toBe('User');
		expect((component as RUC).guestRegistration).toBe(true);
	});

	it('should call registerUser and show success on valid form', async () => {
		userServiceSpy.registerUser.mockReturnValue(of(mockUser));

		fillForm();
		component.register();

		expect(userServiceSpy.registerUser).toHaveBeenCalledWith(
			'testuser',
			'Test',
			'User',
			'test@example.com',
			{ number: '12345678' },
			'abc123',
			'abc123',
		);
		expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Registered successfully. You can now log in');
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('should show error if registration fails', () => {
		userServiceSpy.registerUser.mockReturnValue(of(undefined));

		fillForm();
		component.register();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to register');
	});

	it('should handle error codes from API', () => {
		const error = { error: { code: 'PUD-017', message: 'Username taken' } };
		userServiceSpy.registerUser.mockReturnValue(throwError(() => error));

		fillForm();
		component.register();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Username already taken');
		expect(component.registerUserForm.get('username')?.errors?.['duplicate']).toBe(true);
	});
});
