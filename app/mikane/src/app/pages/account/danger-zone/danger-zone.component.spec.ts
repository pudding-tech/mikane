import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DangerZoneComponent } from './danger-zone.component';

describe('DangerZoneComponent', () => {
	let component: DangerZoneComponent;
	let fixture: ComponentFixture<DangerZoneComponent>;
	let userServiceSpy: { requestDeleteAccount: ReturnType<typeof vi.fn> };
	let dialogSpy: { open: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		userServiceSpy = { requestDeleteAccount: vi.fn() };
		dialogSpy = { open: vi.fn() };
		messageServiceSpy = { showSuccess: vi.fn(), showError: vi.fn() };

		TestBed.configureTestingModule({
			imports: [DangerZoneComponent, RouterTestingModule],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MatDialog, useValue: dialogSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DangerZoneComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		vi.clearAllMocks();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open confirm dialog when delete button is clicked', () => {
		const dialogRefMock: Partial<MatDialogRef<unknown>> = {
			afterClosed: vi.fn(() => of(true)),
		};
		dialogSpy.open.mockReturnValue(dialogRefMock);

		component.deleteUser();

		expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
			width: '400px',
			data: {
				title: 'Send delete account email',
				content: 'Are you sure you want to send the delete account email?',
				confirm: 'Yes, I am sure',
			},
			autoFocus: false,
		});

		expect(userServiceSpy.requestDeleteAccount).toHaveBeenCalledWith();
	});

	it('should not send delete account email when confirm dialog is closed', () => {
		const dialogRefMock: Partial<MatDialogRef<unknown>> = {
			afterClosed: vi.fn(() => of(false)),
		};
		dialogSpy.open.mockReturnValue(dialogRefMock);

		component.deleteUser();

		expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
			width: '400px',
			data: {
				title: 'Send delete account email',
				content: 'Are you sure you want to send the delete account email?',
				confirm: 'Yes, I am sure',
			},
			autoFocus: false,
		});

		expect(userServiceSpy.requestDeleteAccount).not.toHaveBeenCalled();
	});

	it('should show success message and navigate to login page when delete account email is sent', () => {
		const dialogRefMock: Partial<MatDialogRef<unknown>> = {
			afterClosed: vi.fn(() => of(true)),
		};
		dialogSpy.open.mockReturnValue(dialogRefMock);

		userServiceSpy.requestDeleteAccount.mockReturnValue(of(null));
		const routerSpy = vi.spyOn(component['router'], 'navigate');

		component.deleteUser();

		expect(component['loading'].value).toBeFalsy();
		expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Email sent!');
		expect(routerSpy).toHaveBeenCalledWith(['/login']);
	});

	it('should show error message when failed to send delete account email', () => {
		const dialogRefMock: Partial<MatDialogRef<unknown>> = {
			afterClosed: vi.fn(() => throwError(() => new Error('Failed to send email!'))),
		};
		dialogSpy.open.mockReturnValue(dialogRefMock);

		userServiceSpy.requestDeleteAccount.mockReturnValue(of(null));
		const routerSpy = vi.spyOn(component['router'], 'navigate');

		component.deleteUser();

		expect(component['loading'].value).toBeFalsy();
		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to send email!');
		expect(routerSpy).not.toHaveBeenCalled();
	});

	afterEach(() => {
		fixture.destroy();
	});
});
