import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './pages/category/category.component';
import { EventComponent } from './pages/events/event/event.component';
import { EventsComponent } from './pages/events/events.component';
import { ExpendituresComponent } from './pages/expenditures/expenditures.component';
import { LoginComponent } from './pages/login/login.component';
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
		title: 'PuddingDebt',
		component: EventsComponent,
    },
    {
        path: 'events/:eventId',
        component: EventComponent,
        children: [
            {
                path: 'users',
                component: UserComponent
            },
            {
                path: 'expenses',
                component: ExpendituresComponent,
            },
            {
                path: 'categories',
                component: CategoryComponent
            },
            {
                path: 'payment',
                component: PaymentStructureComponent,
            },
        ]
    },
    {
        path: 'login',
        component: LoginComponent,
    }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
