import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/events',
		pathMatch: 'full',
	},
	{
		path: 'events',
		title: 'Mikane',
		loadChildren: () => import('./pages/events/events.routes'),
	},
	{
		path: 'login',
		loadChildren: () => import('./pages/login/login.routes'),
	},
	{
		path: 'register',
		loadChildren: () => import('./pages/register/register-user.routes'),
	},
	{
		path: 'account',
		loadChildren: () => import('./pages/account/account.routes'),
	},
	{
		path: 'reset-password',
		loadChildren: () => import('./pages/reset-password/reset-password.routes'),
	},
	{
		path: 'invite',
		loadChildren: () => import('./pages/invite/invite.routes'),
	},
	{ path: '**', redirectTo: '/events' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
