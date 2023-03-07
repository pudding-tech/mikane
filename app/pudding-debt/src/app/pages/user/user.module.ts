import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { ExpendituresModule } from '../expenditures/expenditures.module';
import { ConfirmDialogModule } from 'src/app/features/confirm-dialog/confirm-dialog.module';

@NgModule({
	declarations: [UserComponent, UserDialogComponent],
	imports: [
		UserRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatDialogModule,
		MatOptionModule,
		MatSelectModule,
		MatExpansionModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		MatFormFieldModule,
		MatTableModule,
		ExpendituresModule,
		ConfirmDialogModule,
	],
})
export class UserModule {}
