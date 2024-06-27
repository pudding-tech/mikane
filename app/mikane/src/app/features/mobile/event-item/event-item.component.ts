import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';

@Component({
	selector: 'app-event-item',
	templateUrl: 'event-item.component.html',
	styleUrls: ['./event-item.component.scss'],
	standalone: true,
	imports: [CommonModule, MatIconModule, MatListModule, MatTooltipModule],
})
export class EventItemComponent {
	event = input.required<PuddingEvent>();
	readonly EventStatusType = EventStatusType;
}
