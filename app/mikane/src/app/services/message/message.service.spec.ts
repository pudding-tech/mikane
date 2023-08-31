import { MatSnackBar } from '@angular/material/snack-bar';

import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { ErrorMessageComponent } from './error/error-message.component';
import { MessageService } from './message.service';
import { SuccessMessageComponent } from './success/success-message.component';

describe('MessageService', () => {
	let service: MessageService;

	beforeEach(async () => {
		await MockBuilder(MessageService).mock(MatSnackBar);
		service = TestBed.inject(MessageService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should open snackbar', () => {
		const snackbar = TestBed.inject(MatSnackBar);
		const spy = spyOn(snackbar, 'open');
		service.openSnackBar('message', 'action');
		expect(spy).toHaveBeenCalled();
	});

	it('should show error message', () => {
		const snackbar = TestBed.inject(MatSnackBar);
		const spy = spyOn(snackbar, 'openFromComponent');
		service.showError('message');
		expect(spy).toHaveBeenCalledWith(ErrorMessageComponent, { data: 'message', panelClass: 'snackbar' });
	});

	it('should show success message', () => {
		const snackbar = TestBed.inject(MatSnackBar);
		const spy = spyOn(snackbar, 'openFromComponent');
		service.showSuccess('message');
		expect(spy).toHaveBeenCalledWith(SuccessMessageComponent, { data: 'message', panelClass: 'snackbar' });
	});
});
