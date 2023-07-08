import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import packageJson from '../../../../package.json';

@Component({
	selector: 'custom-footer',
	templateUrl: 'footer.component.html',
	styleUrls: ['./footer.component.scss'],
	standalone: true,
	imports: [CommonModule, NgIf]
})
export class FooterComponent {
	public version: string = packageJson.version;

	constructor(
		private router: Router,
		public breakpointService: BreakpointService
	) { }

	showFooter() {
		const includedPages = ['login', 'events'];
		const currentPage = this.router.url.split('/').pop();
		return includedPages.includes(currentPage.toLowerCase());
	}
}
