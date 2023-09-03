import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
	let component: ChangePasswordComponent;
	let fixture: ComponentFixture<ChangePasswordComponent>;
	let userServiceSpy: jasmine.SpyObj<UserService>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;
	let routerSpy: jasmine.SpyObj<Router>;

	beforeEach(() => {
		userServiceSpy = jasmine.createSpyObj('UserService', ['changeUserPassword']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showSuccess', 'showError']);
		routerSpy = jasmine.createSpyObj('Router', ['navigate']);

		TestBed.configureTestingModule({
			imports: [
				ChangePasswordComponent,
				ReactiveFormsModule,
				MockModule(MatCardModule),
				MockModule(MatIconModule),
				MockModule(MatFormFieldModule),
				MockModule(MatInputModule),
				MockModule(MatButtonModule),
			],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: Router, useValue: routerSpy },
				BreakpointService,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ChangePasswordComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should add compare validator to form', () => {
		const formSpy = spyOn(component.changePasswordForm, 'addValidators');
		component.ngOnInit();
		expect(formSpy).toHaveBeenCalled();
	});

	it('should call changeUserPassword when form is submitted', () => {
		const user: User = { id: '1', name: 'John Doe' } as User;
		userServiceSpy.changeUserPassword.and.returnValue(of(user));
		component.changePasswordForm.setValue({
			currentPassword: 'password',
			newPassword: 'newpassword',
			newPasswordRetype: 'newpassword',
		});

		component.submit();

		expect(userServiceSpy.changeUserPassword).toHaveBeenCalledWith('password', 'newpassword');
		expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Password changed successfully. You will need to log in again.');
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('should show error message when changeUserPassword fails', () => {
		const error = { error: { message: 'Error' } };
		userServiceSpy.changeUserPassword.and.returnValue(throwError(error));
		component.changePasswordForm.setValue({
			currentPassword: 'password',
			newPassword: 'newpassword',
			newPasswordRetype: 'newpassword',
		});

		component.submit();

		expect(userServiceSpy.changeUserPassword).toHaveBeenCalledWith('password', 'newpassword');
		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change password');
	});

	it('should not call changeUserPassword when form is invalid', () => {
		component.changePasswordForm.setValue({ currentPassword: '', newPassword: '', newPasswordRetype: '' });

		component.submit();

		expect(userServiceSpy.changeUserPassword).not.toHaveBeenCalled();
	});

	afterEach(() => {
		fixture.destroy();
	});
});
