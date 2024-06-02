import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, ContentChildren, ElementRef, EventEmitter, HostListener, Output, QueryList } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { SplitButtonItemDirective } from './split-button-item/split-button-item.directive';

@Component({
	selector: 'app-split-button',
	templateUrl: './split-button.component.html',
	styleUrls: ['./split-button.component.scss'],
	standalone: true,
	animations: [
		trigger('overlayAnimation', [
			transition(':enter', [style({ opacity: 0, transform: 'scaleY(0.8)' }), animate('{{showTransitionParams}}')]),
			transition(':leave', [animate('{{hideTransitionParams}}', style({ opacity: 0 }))]),
		]),
	],
	imports: [CommonModule, MatButtonToggleModule, MatIconModule],
})
export class SplitButtonComponent {
	@Output() splitButtonClick = new EventEmitter();
	@ContentChildren(SplitButtonItemDirective) items: QueryList<SplitButtonItemDirective>;
	@HostListener('document:click', ['$event.target']) outsideClick(target: HTMLElement) {
		if (!this.toggled) {
			return;
		}
		if (!this.self.nativeElement.contains(target)) {
			this.toggled = !this.toggled;
		}
	}

	toggled = false;
	showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
	hideTransitionOptions = '.1s linear';

	constructor(
		private self: ElementRef,
		public breakpointService: BreakpointService,
	) {}

	onClick() {
		this.splitButtonClick.emit();
	}

	toggleDropdown = () => {
		this.toggled = !this.toggled;
	};

	onOutsideClick(event: MouseEvent) {
		if (!this.toggled) {
			return;
		}
		if (!this.self.nativeElement.contains(event.target)) {
			this.toggled = !this.toggled;
		}
	}
}
