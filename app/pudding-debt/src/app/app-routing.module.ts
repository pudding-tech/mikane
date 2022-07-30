import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventComponent } from './pages/event/event.component';
import { ExpendituresComponent } from './pages/expenditures/expenditures.component';
import { PaymentStructureComponent } from './pages/payment-structure/payment-structure.component';
import { UserComponent } from './pages/user/user.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/events',
        pathMatch: 'full'
    },
	{
		path: 'events',
		title: 'Events',
		component: EventComponent,
		children: [
/* 			{
				path: ':eventId/users',
				title: 'Users',
				component: UserComponent,
                children: [
                    {
                        path: ':userId',
                        title: 'User Details',
                        component: UserComponent,
                    }
                ]
			}, */
			{
				path: ':eventId/expenses',
				title: 'Expenses',
				component: ExpendituresComponent,
			},
			{
				path: ':eventId/payment',
				title: 'Payment Structure',
				component: PaymentStructureComponent,
			},
		],
	},
    {
        path: 'events/:eventId/users',
        title: 'Users',
        component: UserComponent
    }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
