import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-loading-spinner',
	templateUrl: './progress-spinner.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatProgressSpinnerModule],
})
export class ProgressSpinnerComponent {}
