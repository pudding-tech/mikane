import { Route } from '@angular/router';
import { authGuard } from 'src/app/services/auth/auth.guard';
import { eventInfoGuard } from '../event-info/event-info.guard';
import { eventSettingsGuard } from '../event-settings/event-settings.guard';
import { EventComponent } from './event/event.component';
import { EventsComponent } from './events.component';

export default [
	{ path: '', component: EventsComponent },
	{
		path: ':eventId',
		component: EventComponent,
		canActivateChild: [authGuard],
		children: [
			{
				path: 'participants',
				title: 'Participants',
				loadChildren: () => import('../participant/participant.routes'),
			},
			{
				path: 'expenses',
				title: 'Expenses',
				loadChildren: () => import('../expenditures/expenditures.routes'),
			},
			{
				path: 'categories',
				title: 'Categories',
				loadChildren: () => import('../category/category.routes'),
			},
			{
				path: 'payment',
				title: 'Payments',
				loadChildren: () => import('../payment-structure/payment-structure.routes'),
			},
			{
				path: 'info',
				title: 'Event Info',
				canActivate: [eventInfoGuard],
				loadChildren: () => import('../event-info/event-info.routes'),
			},
			{
				path: 'settings',
				title: 'Event Settings',
				canActivate: [eventSettingsGuard],
				loadChildren: () => import('../event-settings/event-settings.routes'),
			},
			{ path: '**', redirectTo: 'participants' },
		],
	},
] as Route[];
