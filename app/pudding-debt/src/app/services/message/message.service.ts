import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageComponent } from './error/error-message.component';
import { SuccessMessageComponent } from './success/success-message.component';

@Injectable({
	providedIn: 'root',
})
export class MessageService {
	constructor(private _snackBar: MatSnackBar) {}

	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action);
	}

	showError(message: string) {
		this._snackBar.openFromComponent(ErrorMessageComponent, {
			data: message,
		});
	}

	showSuccess(message: string) {
		this._snackBar.openFromComponent(SuccessMessageComponent, {
			data: message,
		});
	}
}
