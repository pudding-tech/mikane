import { Component, EventEmitter, Input, Output } from '@angular/core';
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
	@Output() splitButtonClick = new EventEmitter();
	@Input() icon = '';
	@Input() text = '';

	onEnter($event?: KeyboardEvent) {
		if ($event.key === 'Enter' || $event.key === ' ') {
			this.splitButtonClick.emit();
		}
	}

	onClick() {
		this.splitButtonClick.emit();
	}
}
