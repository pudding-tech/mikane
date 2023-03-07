import { MatSnackBar } from '@angular/material/snack-bar';

import { MessageService } from './message.service';

describe('MessageService', () => {
	let service: MessageService;
	let snackBarMock: MatSnackBar;

	beforeEach(() => {
		snackBarMock = {} as MatSnackBar;
		service = new MessageService(snackBarMock);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
