import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeleteUserDialogComponent } from './delete-user-dialog/delete-user-dialog.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';

@NgModule({
	declarations: [UserComponent, UserDialogComponent, DeleteUserDialogComponent],
	imports: [UserRoutingModule, SharedModule, FormsModule, ReactiveFormsModule, MatInputModule, MatDialogModule, MatExpansionModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatTableModule],
})
export class UserModule {}
