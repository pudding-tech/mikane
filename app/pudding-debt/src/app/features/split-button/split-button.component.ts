import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface MenuItem {
	title: string;
	link: string;
}

@Component({
	selector: 'split-button',
	templateUrl: './split-button.component.html',
	styleUrls: ['./split-button.component.scss'],
	standalone: true,
	imports: [MatButtonToggleModule, MatIconModule, MatMenuModule, NgFor],
})
export class SplitButtonComponent {
	@Input() onClick: ($event: MouseEvent) => void;
}
