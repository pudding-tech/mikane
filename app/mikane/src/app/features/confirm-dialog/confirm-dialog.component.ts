import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
	templateUrl: './confirm-dialog.component.html',
	styleUrls: ['./confirm-dialog.component.scss'],
	standalone: true,
	imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {
	dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
	data = inject<{ title: string; content: string; extraContent?: string; confirm: string }>(MAT_DIALOG_DATA);

	constructor() {
		const data = this.data;

		if (!data || !data.title || !data.content || !data.confirm) {
			throw 'Something is missing in confirm dialog data';
		}
	}

	onNoClick() {
		this.dialogRef.close();
	}
}
