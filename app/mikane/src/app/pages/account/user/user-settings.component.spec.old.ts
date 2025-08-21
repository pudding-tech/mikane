import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MockModule, MockService } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { UserSettingsComponent } from './user-settings.component';

describe('UserSettingsComponent', () => {
	let component: UserSettingsComponent;
	let fixture: ComponentFixture<UserSettingsComponent>;
	let userServiceSpy: jasmine.SpyObj<UserService>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;
	let formValidationServiceSpy: jasmine.SpyObj<FormValidationService>;
	let breakpointServiceSpy: jasmine.SpyObj<BreakpointService>;
	let matDialogSpy: jasmine.SpyObj<MatDialog>;

	beforeEach(() => {
		userServiceSpy = jasmine.createSpyObj('UserService', ['editUser']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showSuccess', 'showError']);
		formValidationServiceSpy = jasmine.createSpyObj('FormValidationService', [], { usernameRegex: /^[\dA-Za-z]+$/ });
		breakpointServiceSpy = jasmine.createSpyObj('BreakpointService', ['isMobile']);
		matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

		TestBed.configureTestingModule({
			imports: [
				UserSettingsComponent,
				CommonModule,
				MockModule(MatCardModule),
				MockModule(MatIconModule),
				ReactiveFormsModule,
				MockModule(MatFormFieldModule),
				MockModule(MatInputModule),
				MockModule(MatButtonModule),
			],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: FormValidationService, useValue: formValidationServiceSpy },
				{ provide: BreakpointService, useValue: breakpointServiceSpy },
				{ provide: MatDialog, useValue: matDialogSpy },
				{ provide: LogService, useValue: MockService(LogService) },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(UserSettingsComponent);
		component = fixture.componentInstance;
		component.user = {
			id: '1',
			username: 'johndoe',
			firstName: 'John',
			lastName: 'Doe',
			email: 'johndoe@example.com',
			phone: '1234567890',
		} as User;
		fixture.detectChanges();
	});

	afterEach(() => {
		fixture.destroy();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should set the form values to the current user', () => {
			expect(component.editUserForm.value).toEqual({
				username: 'johndoe',
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				phone: '1234567890',
			});
		});

		it('should add async validators to the form controls', () => {
			spyOn(component.editUserForm.get('username'), 'addAsyncValidators');
			spyOn(component.editUserForm.get('email'), 'addAsyncValidators');
			spyOn(component.editUserForm.get('phone'), 'addAsyncValidators');

			component.ngOnInit();

			expect(component.editUserForm.get('username').addAsyncValidators).toHaveBeenCalledWith(jasmine.any(Function));
			expect(component.editUserForm.get('email').addAsyncValidators).toHaveBeenCalledWith(jasmine.any(Function));
			expect(component.editUserForm.get('phone').addAsyncValidators).toHaveBeenCalledWith(jasmine.any(Function));
		});
	});

	describe('editUser', () => {
		it('should call the UserService.editUser method with the correct parameters', () => {
			userServiceSpy.editUser.and.returnValue(of(component.user));

			component.editUserForm.patchValue({
				username: 'newusername',
				firstName: 'New',
				lastName: 'Name',
				email: 'newemail@example.com',
				phone: '0987654321',
			});
			component.editUser();

			expect(userServiceSpy.editUser).toHaveBeenCalledWith(
				component.user.id,
				'newusername',
				'New',
				'Name',
				'newemail@example.com',
				'0987654321',
			);
		});

		it('should show a success message and toggle edit mode on success', () => {
			component.editMode = true;
			userServiceSpy.editUser.and.returnValue(of(component.user));

			component.editUserForm.patchValue({
				username: 'newusername',
				firstName: 'New',
				lastName: 'Name',
				email: 'newemail@example.com',
				phone: '0987654321',
			});
			component.editUser();

			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User edited');
			expect(component.editMode).toBeFalsy();
		});

		it('should show an error message on error', () => {
			const error: ApiError = { error: { message: 'Error' } } as ApiError;
			userServiceSpy.editUser.and.returnValue(throwError(() => error));

			component.editUserForm.patchValue({
				username: 'newusername',
				firstName: 'New',
				lastName: 'Name',
				email: 'newemail@example.com',
				phone: '0987654321',
			});
			component.editUser();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to edit user');
		});
	});

	describe('toggleEditMode', () => {
		it('should toggle the editMode property', () => {
			component.editMode = false;
			component.toggleEditMode();

			expect(component.editMode).toBeTruthy();

			component.editMode = true;
			component.toggleEditMode();

			expect(component.editMode).toBeFalsy();
		});
	});
});
