import { EventComponent } from './event/event.component';
import { EventsComponent } from './events.component';

export default [
	{ path: '', component: EventsComponent },
	{
		path: ':eventId',
		component: EventComponent,
		children: [
			{
				path: 'users',
				loadChildren: () => import('../user/user.routes'),
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
];
