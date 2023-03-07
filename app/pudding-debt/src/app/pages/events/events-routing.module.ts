import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from './event/event.component';
import { EventsComponent } from './events.component';

const routes: Routes = [
	{
		path: '',
		component: EventsComponent,
	},
	{
		path: ':eventId',
		component: EventComponent,
		children: [
			{
				path: 'users',
				loadChildren: () => import('../user/user.module').then((m) => m.UserModule),
			},
			{
				path: 'expenses',
				loadChildren: () => import('../expenditures/expenditures.module').then((m) => m.ExpendituresModule),
			},
			{
				path: 'categories',
				loadChildren: () => import('../category/category.module').then((m) => m.CategoryModule),
			},
			{
				path: 'payment',
				loadChildren: () => import('../payment-structure/payment-structure.module').then((m) => m.PaymentStructureModule),
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class EventsRoutingModule {}
