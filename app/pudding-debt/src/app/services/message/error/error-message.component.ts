import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
	selector: 'error-message',
	templateUrl: './error-message.component.html',
	standalone: true,
})
export class ErrorMessageComponent {
	constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) {}
}
