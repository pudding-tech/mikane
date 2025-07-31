import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, inject, input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
export class PaymentItemComponent implements OnInit, OnChanges {
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
	forceExpanded = input<boolean | undefined>(undefined);

	dropdownOpen: boolean;
	lowerHeight: number | string;

	ngOnInit(): void {
		this.updateExpansionState();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['forceExpanded']) {
			this.updateExpansionState();
		}
	}

	private updateExpansionState(): void {
		if (this.forceExpanded() !== undefined) {
			// External control is active
			this.dropdownOpen = this.forceExpanded()!;
		} else {
			// Default behavior: self payments expanded, others collapsed
			this.dropdownOpen = this.self() ? true : false;
		}
		
		this.lowerHeight = this.dropdownOpen ? 'auto' : 0;
		
		if (this.lowerHeight === 'auto' && this.lower) {
			setTimeout(() => {
				this.lowerHeight = this.lower.nativeElement.scrollHeight;
			});
		}
	}

	toggleDropdown = () => {
		// Don't allow manual toggle when external control is active
		if (this.forceExpanded() !== undefined) {
			return;
		}

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
