import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PuddingEvent } from 'src/app/services/event/event.service';

@Component({
	selector: 'event-dialog',
	templateUrl: 'event-dialog.component.html',
})
export class EventDialogComponent {
	event: { id?: number; name: string; description: string } = { name: '', description: '' };
	edit: boolean;

	constructor(
		public dialogRef: MatDialogRef<EventDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { edit: boolean; event: PuddingEvent }
	) {
		console.log('data', data);
		if (data?.event) {
			this.event.name = data.event.name;
			this.event.description = data.event.description;
			this.event.id = data.event.id;
		}
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSave() {
		this.dialogRef.close(this.event);
	}
}
