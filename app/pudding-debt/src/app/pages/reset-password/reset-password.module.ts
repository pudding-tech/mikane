import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';
import { ForgotPasswordRoutingModule } from './reset-password-routing.module';
import { ForgotPasswordComponent } from './reset-password.component';

@NgModule({
	declarations: [ForgotPasswordComponent],
	imports: [
		ForgotPasswordRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCardModule,
		MatIconModule,
	],
})
export class ForgotPasswordsModule {}
