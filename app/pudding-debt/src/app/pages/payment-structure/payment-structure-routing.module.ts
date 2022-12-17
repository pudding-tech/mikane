import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PaymentStructureComponent } from "./payment-structure.component";

const routes: Routes = [
    {
        path: '',
        component: PaymentStructureComponent
    }
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PaymentStructureRoutingModule {}