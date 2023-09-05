import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import packageJson from '../../../../package.json';

@Component({
	selector: 'custom-footer',
	templateUrl: 'footer.component.html',
	styleUrls: ['./footer.component.scss'],
	standalone: true,
	imports: [CommonModule],
})
export class FooterComponent {
	public version: string = packageJson.version;

	constructor(private router: Router, public breakpointService: BreakpointService) {}

	showFooter() {
		const includedPages = ['events'];
		const currentPage = this.router.url.split('/').pop();
		return includedPages.includes(currentPage.toLowerCase());
	}
}
