import { Component, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
	templateUrl: './error-message.component.html',
	standalone: true,
})
export class ErrorMessageComponent {
	data = inject<string>(MAT_SNACK_BAR_DATA);
}
