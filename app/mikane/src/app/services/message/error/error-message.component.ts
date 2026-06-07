import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
	templateUrl: './error-message.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	standalone: true,
})
export class ErrorMessageComponent {
	data = inject<string>(MAT_SNACK_BAR_DATA);
}
