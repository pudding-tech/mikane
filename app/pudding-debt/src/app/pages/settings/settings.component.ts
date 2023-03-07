import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
	constructor(private authService: AuthService, private router: Router) {}

	logout() {
		this.authService.logout().subscribe(() => {
			this.router.navigate(['/login']);
		});
	}
}
