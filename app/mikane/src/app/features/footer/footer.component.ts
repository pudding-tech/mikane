import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import packageJson from '../../../../package.json';

@Component({
	selector: 'app-custom-footer',
	templateUrl: 'footer.component.html',
	styleUrls: ['./footer.component.scss'],
	imports: [CommonModule],
})
export class FooterComponent {
	private router = inject(Router);
	breakpointService = inject(BreakpointService);

	public version: string = packageJson.version;

	showFooter() {
		const includedPages = ['events'];
		const currentPage = this.router.url.split('/').pop();
		return includedPages.includes(currentPage.toLowerCase());
	}
}
