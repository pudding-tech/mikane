import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Route } from '@angular/router';
import { map } from 'rxjs';
import { authGuard } from 'src/app/services/auth/auth.guard';
import { EventService } from 'src/app/services/event/event.service';
import { eventInfoGuard } from '../event-info/event-info.guard';
import { eventSettingsGuard } from '../event-settings/event-settings.guard';
import { EventComponent } from './event/event.component';
import { EventsComponent } from './events.component';

const eventTitleResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
	const eventService = inject(EventService);
	const cachedName = eventService.getCachedEventName(route.parent?.params['eventId']);

  if (cachedName) {
    return cachedName + ' | Mikane';
  }
  return eventService.getEvent(route.parent?.params['eventId']).pipe(
    map(event => event.name + ' | Mikane')
  );
};

export default [
	{ path: '', component: EventsComponent },
	{
		path: ':eventId',
		component: EventComponent,
		canActivateChild: [authGuard],
		children: [
			{
				path: 'participants',
				title: eventTitleResolver,
				loadChildren: () => import('../participant/participant.routes'),
			},
			{
				path: 'expenses',
				title: eventTitleResolver,
				loadChildren: () => import('../expenditures/expenditures.routes'),
			},
			{
				path: 'categories',
				title: eventTitleResolver,
				loadChildren: () => import('../category/category.routes'),
			},
			{
				path: 'payment',
				title: eventTitleResolver,
				loadChildren: () => import('../payment-structure/payment-structure.routes'),
			},
			{
				path: 'info',
				title: eventTitleResolver,
				canActivate: [eventInfoGuard],
				loadChildren: () => import('../event-info/event-info.routes'),
			},
			{
				path: 'settings',
				title: eventTitleResolver,
				canActivate: [eventSettingsGuard],
				loadChildren: () => import('../event-settings/event-settings.routes'),
			},
			{ path: '**', redirectTo: 'participants' },
		],
	},
] as Route[];
