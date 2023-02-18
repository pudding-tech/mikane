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
		title: 'PuddingDebt',
		loadChildren: () => import('./pages/events/events.module').then((m) => m.EventsModule),
	},
	{
		path: 'login',
		loadChildren: () => import('./pages/login/login.module').then((m) => m.LoginModule),
	},
	{
		path: 'register',
		loadChildren: () => import('./pages/register/register-user.module').then((m) => m.RegisterUserModule),
	},
	{
		path: 'reset-password',
		loadChildren: () => import('./pages/reset-password/reset-password.module').then((m) => m.ForgotPasswordsModule),
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
