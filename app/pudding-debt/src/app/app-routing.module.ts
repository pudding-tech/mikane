import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './pages/category/category.component';
import { EventComponent } from './pages/events/event/event.component';
import { EventsComponent } from './pages/events/events.component';
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
		component: EventsComponent,
    },
    {
        path: 'events/:eventId',
        title: 'Event',
        component: EventComponent,
        children: [
            {
                path: 'users',
                title: 'Users',
                component: UserComponent
            },
            {
                path: 'expenses',
                title: 'Expenses',
                component: ExpendituresComponent,
            },
            {
                path: 'categories',
                title: 'Categories',
                component: CategoryComponent
            },
            {
                path: 'payment',
                title: 'Payment Structure',
                component: PaymentStructureComponent,
            },
        ]
    }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
