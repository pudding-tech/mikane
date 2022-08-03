import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventService } from 'src/app/services/event/event.service';

@Component({
	selector: 'event-dialog',
	templateUrl: 'event-dialog.component.html',
})
export class EventDialogComponent implements OnInit {
  event: any = "";
    
	constructor(
		public dialogRef: MatDialogRef<EventDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: number,
        private eventService: EventService
	) {}

  ngOnInit() {

  }

	onNoClick(): void {
		this.dialogRef.close();
	}

  onSave() {
      this.dialogRef.close(this.event);
  }
}
