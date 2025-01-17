import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, inject, input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';

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
		FormControlPipe,
		FormsModule,
		ReactiveFormsModule,
	],
})
export class PaymentItemComponent implements OnInit {
	private router = inject(Router);

	@ViewChild('lower') lower: ElementRef;
	payment = input.required<{
		sender: User;
		receivers: Array<{
			receiver: User;
			amount: number;
		}>;
	}>();
	self = input.required<boolean>();
	currentUser = input.required<User>();

	dropdownOpen: boolean;
	lowerHeight: number | string;

	ngOnInit(): void {
		this.dropdownOpen = this.self() ? true : false;
		this.lowerHeight = this.self() ? 'auto' : 0;
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
		} else {
			this.lowerHeight = 0;
		}
	};

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}
}
