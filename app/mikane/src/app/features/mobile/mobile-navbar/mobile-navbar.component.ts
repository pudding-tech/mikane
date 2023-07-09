import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface Route {
	name: string;
	icon: string;
	location: string;
}

@Component({
	selector: 'mobile-navbar',
	templateUrl: 'mobile-navbar.component.html',
	styleUrls: ['./mobile-navbar.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterLink, RouterOutlet, MatIconModule],
})
export class MobileNavbarComponent {
	@Input('activeLink') activeLink: string;
	@Input('links') links: Route[];
}
