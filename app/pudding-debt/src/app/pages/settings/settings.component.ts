import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UserSettingsComponent } from './user/user-settings.component';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	standalone: true,
	imports: [MatToolbarModule, MatButtonModule, MatDialogModule, RouterLink, MatIconModule, UserSettingsComponent, ResetPasswordComponent, MenuComponent],
})
export class SettingsComponent {
	constructor(private authService: AuthService, private router: Router) {}
}
