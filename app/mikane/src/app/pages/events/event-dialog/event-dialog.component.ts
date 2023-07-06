import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
	selector: 'event-dialog',
	templateUrl: 'event-dialog.component.html',
	styleUrls: ['event-dialog.component.scss'],
	standalone: true,
	imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
})
export class EventDialogComponent {
	event: { id?: string; name: string; description: string } = { name: '', description: '' };
	edit: boolean;
	currentName: string;
	currentDescription: string;

	constructor(
		public dialogRef: MatDialogRef<EventDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { edit: boolean; event: PuddingEvent }
	) {
		if (data?.event) {
			this.event.name = data.event.name;
			this.event.description = data.event.description;
			this.event.id = data.event.id;
			this.currentName = data.event.name;
			this.currentDescription = data.event.description;
		}
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	onSave() {
		this.dialogRef.close(this.event);
	}

	isChanged() {
		return this.event.name !== this.currentName || this.event.description !== this.currentDescription;
	}
}
