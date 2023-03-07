import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { PaymentStructureRoutingModule } from './payment-structure-routing.module';
import { PaymentStructureComponent } from './payment-structure.component';

@NgModule({
	imports: [
		PaymentStructureRoutingModule,
		MatButtonModule,
		MatCardModule,
		MatExpansionModule,
		MatTableModule,
		MatIconModule,
		PaymentStructureComponent,
	],
})
export class PaymentStructureModule {}
