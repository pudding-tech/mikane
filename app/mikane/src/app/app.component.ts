import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { ENV } from 'src/environments/environment.provider';
import { FooterComponent } from './features/footer/footer.component';
import { LogService } from './services/log/log.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	imports: [RouterOutlet, FooterComponent],
})
export class AppComponent {
	private iconRegistry = inject(MatIconRegistry);
	private sanitizer = inject(DomSanitizer);
	private logService = inject(LogService);
	private env = inject(ENV);

	constructor() {
		this.iconRegistry.addSvgIcon(
			'passkey_outlined',
			this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/passkey_outlined.svg'),
		);

		const today = new Date();
		this.logService.info('Client time: ' + today.toString() + ' - Timezone offset: ' + today.getTimezoneOffset() + ' minutes');
		this.logService.info('Client version: ' + this.env.version);
		this.logService.info('Client user agent: ' + window.navigator?.userAgent);
	}
}
