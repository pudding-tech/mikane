import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, inject, input, output, effect, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-payment-item',
	templateUrl: 'payment-item.component.html',
	styleUrls: ['./payment-item.component.scss'],
	imports: [
		CommonModule,
		MatIconModule,
		CurrencyPipe,
		MatListModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		ReactiveFormsModule,
		NgOptimizedImage,
	],
})
export class PaymentItemComponent {
	private router = inject(Router);

	@ViewChild('lower') lower: ElementRef;
	payment = input.required<{
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	}>();
	self = input.required<boolean>();
	currentUser = input.required<User>();
	expanded = input<boolean>(false);
	dropdownToggled = output<{ senderId: string, expanded: boolean, self: boolean }>();

	dropdownOpen: boolean;
	lowerHeight: number | string;
	private initialized = false;

	constructor() {
		effect(() => {
			this.dropdownOpen = this.expanded();
			this.lowerHeight = this.dropdownOpen ? 'auto' : 0;
			if (this.lowerHeight === 'auto') {
				if (!this.initialized) {
					setTimeout(() => {
						this.lowerHeight = this.lower.nativeElement.scrollHeight;
						this.initialized = true;
					});
				}
				else {
					this.lowerHeight = this.lower.nativeElement.scrollHeight;
				}
			}
		});
	}

	toggleDropdown = () => {
		this.dropdownOpen = !this.dropdownOpen;

		if (this.lowerHeight === 0) {
			this.lowerHeight = this.lower.nativeElement.scrollHeight;
		} else {
			this.lowerHeight = 0;
		}

		this.dropdownToggled.emit({ senderId: this.payment().sender.id, expanded: this.dropdownOpen, self: this.self() });
	};

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}
}
