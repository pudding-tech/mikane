import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTableModule } from "@angular/material/table";
import { SharedModule } from "src/app/shared/shared.module";
import { PaymentStructureRoutingModule } from "./payment-structure-routing.module";
import { PaymentStructureComponent } from "./payment-structure.component";

@NgModule({
    declarations: [PaymentStructureComponent],
    imports: [PaymentStructureRoutingModule, SharedModule, MatButtonModule, MatCardModule, MatExpansionModule, MatTableModule]
})
export class PaymentStructureModule {}