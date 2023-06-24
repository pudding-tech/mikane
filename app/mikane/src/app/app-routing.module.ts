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
		path: 'settings',
		loadChildren: () => import('./pages/settings/settings.routes'),
	},
	{ path: '**', redirectTo: '/events' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
