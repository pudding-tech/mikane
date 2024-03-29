import { CommonModule, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';

@Component({
	selector: 'app-event-item',
	templateUrl: 'event-item.component.html',
	styleUrls: ['./event-item.component.scss'],
	standalone: true,
	imports: [CommonModule, NgIf, MatIconModule, MatListModule, MatTooltipModule],
})
export class EventItemComponent {
	@Input() event: PuddingEvent;
	readonly EventStatusType = EventStatusType;
}
