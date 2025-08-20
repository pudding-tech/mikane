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
		canActivate: [authGuard],
		loadChildren: () => import('./pages/events/events.routes'),
	},
	{
		path: 'login',
		title: 'Login',
		canActivate: [loggedInGuard],
		loadChildren: () => import('./pages/login/login.routes'),
	},
	{
		path: 'register',
		title: 'Register',
		canActivate: [loggedInGuard],
		loadChildren: () => import('./pages/register/register-user.routes'),
	},
	{
		path: 'account',
		title: 'Account',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/account/account.routes'),
	},
	{
		path: 'reset-password',
		title: 'Reset password',
		canActivate: [loggedInGuard],
		loadChildren: () => import('./pages/reset-password/reset-password.routes'),
	},
	{
		path: 'guests',
		title: 'Guests',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/guests/guests.routes'),
	},
	{
		path: 'invite',
		title: 'Invite User',
		canActivate: [authGuard],
		loadChildren: () => import('./pages/invite/invite.routes'),
	},
	{
		path: 'delete-account',
		title: 'Delete Account',
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
	imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
