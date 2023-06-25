import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UserSettingsComponent } from './user/user-settings.component';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.scss'],
	standalone: true,
	imports: [
		MatToolbarModule,
		MatButtonModule,
		MatDialogModule,
		RouterLink,
		MatIconModule,
		UserSettingsComponent,
		ChangePasswordComponent,
		MenuComponent,
	],
})
export class SettingsComponent {
	constructor() {}
}
