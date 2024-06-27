import { Component, input, output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'app-split-button-item',
	templateUrl: './split-button-item.component.html',
	styleUrls: ['./split-button-item.component.scss'],
	standalone: true,
	imports: [MatIconModule, MatRippleModule],
})
export class SplitButtonItemComponent {
	splitButtonClick = output();
	icon = input.required<string>();
	text = input.required<string>();

	onEnter($event?: KeyboardEvent) {
		if ($event.key === 'Enter' || $event.key === ' ') {
			this.splitButtonClick.emit();
		}
	}

	onClick() {
		this.splitButtonClick.emit();
	}
}
