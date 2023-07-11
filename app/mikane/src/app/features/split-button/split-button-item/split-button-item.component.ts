import { Component, Input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'split-button-item',
	templateUrl: './split-button-item.component.html',
	styleUrls: ['./split-button-item.component.scss'],
	standalone: true,
	imports: [MatIconModule, MatRippleModule],
})
export class SplitButtonItemComponent {
	@Input({ required: true }) onClick: () => void;
	@Input('icon') icon: string = '';
	@Input('text') text: string = '';
}
