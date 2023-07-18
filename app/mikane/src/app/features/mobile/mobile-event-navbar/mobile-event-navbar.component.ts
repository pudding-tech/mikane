import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

interface Route {
	name: string;
	icon: string;
	location: string;
}

@Component({
	selector: 'mobile-event-navbar',
	templateUrl: 'mobile-event-navbar.component.html',
	styleUrls: ['./mobile-event-navbar.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterLink, RouterOutlet, MatIconModule, MatRippleModule],
})
export class MobileEventNavbarComponent {
	@Input('activeLink') activeLink: string;
	@Input('links') links: Route[];
}
