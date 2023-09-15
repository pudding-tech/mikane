import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
	templateUrl: './success-message.component.html',
	standalone: true,
})
export class SuccessMessageComponent {
	constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string) {}
}
