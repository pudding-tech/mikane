import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'mobile-navbar',
	templateUrl: 'mobile-navbar.component.html',
	styleUrls: ['./mobile-navbar.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterLink, RouterOutlet, MatIconModule],
})
export class MobileNavbarComponent {
	@Input('activeLink') activeLink: string;
	links = [
		{
			name: 'Participants',
			icon: 'person',
			location: './users',
		},
		{
			name: 'Expenses',
			icon: 'payment',
			location: './expenses',
		},
		{
			name: 'Categories',
			icon: 'category',
			location: './categories',
		},
		{
			name: 'Payments',
			icon: 'account_balance_wallet',
			location: './payment',
		},
	];
}
