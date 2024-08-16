import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { EventNameValidatorDirective } from 'src/app/shared/forms/validators/async-event-name.validator';

@Component({
	templateUrl: 'event-dialog.component.html',
	styleUrls: ['event-dialog.component.scss'],
	standalone: true,
	imports: [
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatButtonModule,
		EventNameValidatorDirective,
		MatSlideToggleModule,
		MatProgressSpinnerModule,
	],
})
export class EventDialogComponent {
	dialogRef = inject<MatDialogRef<EventDialogComponent>>(MatDialogRef);
	data = inject<{ edit: boolean; event: PuddingEvent }>(MAT_DIALOG_DATA);

	event: { id?: string; name: string; description: string; private: boolean } = { name: '', description: '', private: false };
	edit: boolean;
	currentName: string;
	currentDescription: string;

	constructor() {
		const data = this.data;

		if (data?.event) {
			this.event.id = data.event.id;
			this.event.name = data.event.name;
			this.event.description = data.event.description;
			this.event.private = data.event.private;
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
