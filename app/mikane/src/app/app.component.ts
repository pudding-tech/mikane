import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
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
	private swUpdate = inject(SwUpdate);
	private snackBar = inject(MatSnackBar);

	constructor() {
		this.iconRegistry.addSvgIcon(
			'passkey_outlined',
			this.sanitizer.bypassSecurityTrustResourceUrl('assets/icons/passkey_outlined.svg'),
		);

		const today = new Date();
		this.logService.info('Client time: ' + today.toString() + ' - Timezone offset: ' + today.getTimezoneOffset() + ' minutes');
		this.logService.info('Client version: ' + this.env.version);
		this.logService.info('Client user agent: ' + window.navigator?.userAgent);

		if (this.swUpdate.isEnabled) {
			this.swUpdate.versionUpdates
				.pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
				.subscribe(() => {
					const ref = this.snackBar.open('A new version is available.', 'Reload', { panelClass: 'snackbar', duration: 0 });
					ref.onAction().subscribe(() => document.location.reload());
				});
		}
	}
}
