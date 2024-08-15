import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './features/footer/footer.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: true,
	imports: [RouterOutlet, FooterComponent],
})
export class AppComponent {
	private iconRegistry = inject(MatIconRegistry);
	private sanitizer = inject(DomSanitizer);

	constructor() {
		this.iconRegistry.addSvgIcon(
			'passkey_outlined',
			this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/passkey_outlined.svg')
		);
	}
}
