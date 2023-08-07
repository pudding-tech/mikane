import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventService } from 'src/app/services/event/event.service';
import { map } from 'rxjs';

export const eventSettingsGuard: CanActivateFn = (route, state) => {
	const router = inject(Router);
	const eventService = inject(EventService);
	const eventId = route.parent.paramMap.get('eventId');
	return eventService.getEvent(eventId).pipe(
		map((event) => {
			if (event.userInfo.isAdmin) {
				return true;
			} else {
				return router.parseUrl(`/events/${eventId}/participants`);
			}
		})
	);
};
