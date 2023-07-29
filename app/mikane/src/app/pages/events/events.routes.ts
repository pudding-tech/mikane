import { Route } from '@angular/router';
import { authGuard } from 'src/app/services/auth/auth.guard';
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
				loadChildren: () => import('../participant/participant.routes'),
			},
			{
				path: 'expenses',
				loadChildren: () => import('../expenditures/expenditures.routes'),
			},
			{
				path: 'categories',
				loadChildren: () => import('../category/category.routes'),
			},
			{
				path: 'payment',
				loadChildren: () => import('../payment-structure/payment-structure.routes'),
			},
		],
	},
] as Route[];
