import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { UserSettingsComponent } from './user/user-settings.component';

const routes: Routes = [
	{
		path: '',
		component: SettingsComponent,
	},
	{
		path: 'user',
		component: UserSettingsComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SettingsRoutingModule {}
