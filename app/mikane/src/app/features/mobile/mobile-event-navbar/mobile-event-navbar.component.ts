import { CommonModule } from '@angular/common';
import { Component, computed, input, model } from '@angular/core';
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
export class MobileEventNavbarComponent {
	activeLink = model.required<string>();
	links = input.required<Route[]>();

	mobileLinks = computed(() => {
		return [
			{
				name: '',
				icon: 'arrow_back_ios',
				location: '/events',
			},
			...this.links(),
		];
	});

	constructor(public contextService: ContextService) {}
}
