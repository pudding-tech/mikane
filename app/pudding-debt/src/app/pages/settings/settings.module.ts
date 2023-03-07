import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { UserSettingsComponent } from './user/user-settings.component';

@NgModule({
	imports: [
		SettingsRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatToolbarModule,
		MatCardModule,
		SettingsComponent,
		ResetPasswordComponent,
		UserSettingsComponent,
	],
})
export class SettingsModule {}
