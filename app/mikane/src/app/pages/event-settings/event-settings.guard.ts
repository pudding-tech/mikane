import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { EventService } from 'src/app/services/event/event.service';

export const eventSettingsGuard: CanActivateFn = (route) => {
	const router = inject(Router);
	const eventService = inject(EventService);
	const eventId = route.parent.paramMap.get('eventId');
	return eventService.getEvent(eventId).pipe(
		map((event) => {
			if (event.userInfo.isAdmin) {
				return true;
			} else {
				return router.parseUrl(`/events/${eventId}/info`);
			}
		})
	);
};
