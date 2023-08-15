import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './services/auth/auth.guard';
import { loggedInGuard } from './services/auth/logged-in.guard';

const routes: Routes = [
	{
		path: '',
		redirectTo: '/events',
		pathMatch: 'full',
	},
	{
		path: 'events',
		title: 'Mikane',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/events/events.routes'),
	},
	{
		path: 'login',
		canActivate: [loggedInGuard],
		loadChildren: () => import('./pages/login/login.routes'),
	},
	{
		path: 'register',
		canActivate: [loggedInGuard],
		loadChildren: () => import('./pages/register/register-user.routes'),
	},
	{
		path: 'account',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/account/account.routes'),
	},
	{
		path: 'reset-password',
		canActivate: [loggedInGuard],
		loadChildren: () => import('./pages/reset-password/reset-password.routes'),
	},
	{
		path: 'invite',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/invite/invite.routes'),
	},
	{
		path: 'delete-account',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/delete-account/delete-account.routes'),
	},
	{
		path: 'u',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/profile/profile.routes'),
	},
	{ path: '**', redirectTo: '/events' },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
