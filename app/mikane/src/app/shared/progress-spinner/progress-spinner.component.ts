import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-loading-spinner',
	templateUrl: './progress-spinner.component.html',
	standalone: true,
	imports: [MatProgressSpinnerModule],
})
export class ProgressSpinnerComponent {}
