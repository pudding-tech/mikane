import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
	templateUrl: './confirm-dialog.component.html',
	styleUrls: ['./confirm-dialog.component.scss'],
	standalone: true,
	imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {
	constructor(
		public dialogRef: MatDialogRef<ConfirmDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { title: string; content: string; confirm: string }
	) {
		if (!data || !data.title || !data.content || !data.confirm) {
			throw 'Something is missing in confirm dialog data';
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}
}
