import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorMessageComponent } from './error/error-message.component';
import { MessageService } from './message.service';
import { SuccessMessageComponent } from './success/success-message.component';

describe('MessageService', () => {
	let service: MessageService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MessageService,
				{
					provide: MatSnackBar,
					useValue: {
						open: vi.fn(),
						openFromComponent: vi.fn(),
					},
				},
			],
		});

		service = TestBed.inject(MessageService);
	});

	it('should open snackbar', () => {
		const snackbar = TestBed.inject(MatSnackBar);
		const spy = vi.spyOn(snackbar, 'open');
		service.openSnackBar('message', 'action');

		expect(spy).toHaveBeenCalledWith('message', 'action', { panelClass: 'snackbar' });
	});

	it('should show error message', () => {
		const snackbar = TestBed.inject(MatSnackBar);
		const spy = vi.spyOn(snackbar, 'openFromComponent');
		service.showError('message');

		expect(spy).toHaveBeenCalledWith(ErrorMessageComponent, { data: 'message', panelClass: 'snackbar' });
	});

	it('should show success message', () => {
		const snackbar = TestBed.inject(MatSnackBar);
		const spy = vi.spyOn(snackbar, 'openFromComponent');
		service.showSuccess('message');

		expect(spy).toHaveBeenCalledWith(SuccessMessageComponent, { data: 'message', panelClass: 'snackbar' });
	});
});
