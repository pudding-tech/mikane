import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';

@NgModule({
	declarations: [LoginComponent],
	imports: [
		LoginRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		MatButtonModule,
		MatInputModule,
		MatCardModule,
		MatFormFieldModule,
		MatIconModule,
		MatToolbarModule,
	],
})
export class LoginModule {}
