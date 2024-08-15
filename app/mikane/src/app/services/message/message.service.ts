import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ErrorMessageComponent } from './error/error-message.component';
import { SuccessMessageComponent } from './success/success-message.component';

@Injectable({
	providedIn: 'root',
})
export class MessageService {
	private _snackBar = inject(MatSnackBar);


	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			panelClass: "snackbar"
		});
	}

	showError(message: string) {
		this._snackBar.openFromComponent(ErrorMessageComponent, {
			data: message,
			panelClass: "snackbar"
		});
	}

	showSuccess(message: string) {
		this._snackBar.openFromComponent(SuccessMessageComponent, {
			data: message,
			panelClass: "snackbar"
		});
	}
}
