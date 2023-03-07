import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@NgModule({
	declarations: [ConfirmDialogComponent],
	imports: [MatButtonModule, MatDialogModule, MatIconModule],
	exports: [ConfirmDialogComponent],
})
export class ConfirmDialogModule {}
