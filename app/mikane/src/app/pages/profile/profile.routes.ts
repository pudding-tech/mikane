import { Route } from '@angular/router';
import { ProfileComponent } from './profile.component';

export default [
	{ path: '', component: ProfileComponent },
	{ path: ':id', component: ProfileComponent },
] as Route[];
