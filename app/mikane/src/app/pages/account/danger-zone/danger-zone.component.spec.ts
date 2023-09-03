import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { DangerZoneComponent } from './danger-zone.component';

describe('DangerZoneComponent', () => {
	let component: DangerZoneComponent;
	let fixture: ComponentFixture<DangerZoneComponent>;
	let userServiceSpy: jasmine.SpyObj<UserService>;
	let dialogSpy: jasmine.SpyObj<MatDialog>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;

	beforeEach(() => {
		userServiceSpy = jasmine.createSpyObj('UserService', ['requestDeleteAccount']);
		dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showSuccess', 'showError']);

		TestBed.configureTestingModule({
			imports: [DangerZoneComponent, RouterTestingModule],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MatDialog, useValue: dialogSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DangerZoneComponent);
		component = fixture.componentInstance;
		component.currentUser = { id: '1', name: 'John Doe' } as User;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open confirm dialog when delete button is clicked', () => {
		const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
		dialogSpy.open.and.returnValue(dialogRefSpy);
		dialogRefSpy.afterClosed.and.returnValue(of(true));

		component.deleteUser();

		expect(dialogSpy.open).toHaveBeenCalled();
		expect(userServiceSpy.requestDeleteAccount).toHaveBeenCalled();
	});

	it('should not send delete account email when confirm dialog is closed', () => {
		const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
		dialogSpy.open.and.returnValue(dialogRefSpy);
		dialogRefSpy.afterClosed.and.returnValue(of(false));

		component.deleteUser();

		expect(dialogSpy.open).toHaveBeenCalled();
		expect(userServiceSpy.requestDeleteAccount).not.toHaveBeenCalled();
	});

	it('should show success message and navigate to login page when delete account email is sent', () => {
		const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
		dialogSpy.open.and.returnValue(dialogRefSpy);
		dialogRefSpy.afterClosed.and.returnValue(of(true));

		userServiceSpy.requestDeleteAccount.and.returnValue(of(null));
		const routerSpy = spyOn(component['router'], 'navigate');

		component.deleteUser();

		expect(component['loading']).toBeFalsy();
		expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Email sent!');
		expect(routerSpy).toHaveBeenCalledWith(['/login']);
	});

	it('should show error message when failed to send delete account email', () => {
		const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
		dialogSpy.open.and.returnValue(dialogRefSpy);
		dialogRefSpy.afterClosed.and.returnValue(throwError(() => new Error('Failed to send email!')));

		userServiceSpy.requestDeleteAccount.and.returnValue(of(null));
		const routerSpy = spyOn(component['router'], 'navigate');

		component.deleteUser();

		expect(component['loading']).toBeFalsy();
		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to send email!');
		expect(routerSpy).not.toHaveBeenCalled();
	});

	afterEach(() => {
		fixture.destroy();
	});
});
