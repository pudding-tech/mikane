import { Component, Input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'split-button',
	templateUrl: './split-button.component.html',
	styleUrls: ['./split-button.component.scss'],
	standalone: true,
	imports: [MatButtonToggleModule, MatIconModule],
})
export class SplitButtonComponent {
	@Input() onClick: ($event: MouseEvent) => void;
	@Input() toggleDropdown: ($event: MouseEvent) => void;
}
