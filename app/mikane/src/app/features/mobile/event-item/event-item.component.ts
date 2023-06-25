import { Component, Input } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
	selector: 'event-item',
	templateUrl: 'event-item.component.html',
	styleUrls: ['./event-item.component.scss'],
	standalone: true,
	imports: [CommonModule, NgIf, MatIconModule, MatListModule, MatTooltipModule],
})
export class EventItemComponent {
	@Input('event') event: PuddingEvent;
}
