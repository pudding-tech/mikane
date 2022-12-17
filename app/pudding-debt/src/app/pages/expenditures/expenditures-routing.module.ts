import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpendituresComponent } from './expenditures.component';

const routes: Routes = [
	{
		path: '',
		component: ExpendituresComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ExpenditureRoutingModule {}
