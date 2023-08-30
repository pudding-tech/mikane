import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'payment-item',
	templateUrl: 'payment-item.component.html',
	styleUrls: ['./payment-item.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		CurrencyPipe,
		MatListModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		FormControlPipe,
		FormsModule,
		ReactiveFormsModule,
	],
})
export class PaymentItemComponent {
	@ViewChild('lower') lower: ElementRef;
	@Input('sender') sender: {
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	};
	@Input() self: boolean;
	@Input() currentUser: User;

	dropdownOpen: boolean;
	lowerHeight: number | string;

	ngOnInit(): void {
		this.dropdownOpen = this.self ? true : false;
		this.lowerHeight = this.self ? 'auto' : 0;
		if (this.lowerHeight === 'auto') {
			setTimeout(() => {
				this.lowerHeight = this.lower.nativeElement.scrollHeight;
			});
    }
	}

	toggleDropdown = () => {
		this.dropdownOpen = !this.dropdownOpen;

		if (this.lowerHeight === 0) {
			this.lowerHeight = this.lower.nativeElement.scrollHeight;
		}
		else {
			this.lowerHeight = 0;
		}
	};
}
