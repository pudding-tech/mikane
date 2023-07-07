import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'mobile-nav',
	templateUrl: 'navbar.component.html',
	styleUrls: ['./navbar.component.scss'],
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
			icon: 'account_balance_wallet',
			location: './expenses',
		},
		{
			name: 'Categories',
			icon: 'category',
			location: './categories',
		},
		{
			name: 'Payments',
			icon: 'payment',
			location: './payment',
		},
	];

	constructor(
		// private route: ActivatedRoute,
		// private router: Router
	) { };

	ngOnInit() {
		// console.log("child init");
		// console.log(this.activeLink);
	}

	gotoPayments() {
		console.log("pay click");
		// console.log(this.route);
		// console.log(this.router);
	}
}
