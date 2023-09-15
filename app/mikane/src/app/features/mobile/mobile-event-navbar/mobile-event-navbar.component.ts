import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ContextService } from 'src/app/services/context/context.service';

interface Route {
	name: string;
	icon: string;
	location: string;
}

@Component({
	selector: 'app-mobile-event-navbar',
	templateUrl: 'mobile-event-navbar.component.html',
	styleUrls: ['./mobile-event-navbar.component.scss'],
	standalone: true,
	imports: [CommonModule, RouterLink, RouterOutlet, MatIconModule, MatRippleModule],
})
export class MobileEventNavbarComponent implements OnInit {
	@Input() activeLink: string;
	@Input() links: Route[];

	constructor(public contextService: ContextService) {}

	mobileLinks: Route[];

	ngOnInit(): void {
		this.mobileLinks = [
			{
				name: '',
				icon: 'arrow_back_ios',
				location: '/events',
			},
			...this.links,
		];
	}
}
