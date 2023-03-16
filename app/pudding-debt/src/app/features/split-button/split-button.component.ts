import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'split-button',
	templateUrl: './split-button.component.html',
	styleUrls: ['./split-button.component.scss'],
	standalone: true,
	animations: [
		trigger('overlayAnimation', [
			transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]),
			transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))])
		])
	],
	host: {
		'(document:click)': 'onOutsideClick($event)'
	},
	imports: [NgIf, MatButtonToggleModule, MatIconModule],
})
export class SplitButtonComponent {
	@Input() onClick: () => void;
	@Output() onDropdownClick: EventEmitter<any> = new EventEmitter();

	self: ElementRef;
	toggled = false;
	showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
	hideTransitionOptions = '.1s linear';

	constructor (element: ElementRef) {
		this.self = element;
	};

	toggleDropdown = () => {
		this.toggled = !this.toggled;
	};

	dropdownClicked = (index: number) => {
		this.onDropdownClick.emit(index);
	}

	onOutsideClick(event: any) {
		if (!this.toggled) {
			return;
		}
		if (!this.self.nativeElement.contains(event.target)) {
			this.toggled = !this.toggled;
		}
	}
}
