import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'event-dialog',
	templateUrl: 'event-dialog.component.html',
})
export class EventDialogComponent {
	event: any = '';

	constructor(
		public dialogRef: MatDialogRef<EventDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: number
	) {}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSave() {
		this.dialogRef.close(this.event);
	}
}
