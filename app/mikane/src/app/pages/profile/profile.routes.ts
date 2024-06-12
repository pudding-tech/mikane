import { Route } from '@angular/router';
import { ProfileComponent } from './profile.component';

export default [
	{ path: '', component: ProfileComponent },
	{ path: ':username', component: ProfileComponent },
] as Route[];
