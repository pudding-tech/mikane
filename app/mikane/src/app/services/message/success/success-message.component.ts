import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
	selector: 'app-success-message-component',
	templateUrl: './success-message.component.html',
	standalone: true,
})
export class SuccessMessageComponent {
	data = inject<string>(MAT_SNACK_BAR_DATA);
}
