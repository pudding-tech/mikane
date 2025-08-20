import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventService } from '../event/event.service';

@Injectable()
export class MikaneTitleStrategy extends TitleStrategy {
	private title = inject(Title);
	private eventService = inject(EventService);
	private subscription: Subscription;

	override updateTitle(snapshot: RouterStateSnapshot): void {
		this.subscription?.unsubscribe();

		const title = this.buildTitle(snapshot) || '';
		const eventId = snapshot.root.firstChild?.firstChild?.params['eventId'];

		if (eventId) {
			this.subscription = this.eventService.getEventName(eventId).subscribe((name) => {
				this.title.setTitle(name ? `${title} - ${name} | Mikane` : title);
			});
		} else {
			this.title.setTitle(title ? title + ' | Mikane' : 'Mikane');
		}
	}
}
