import { NgModule } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ProgressSpinnerComponent } from "./progress-spinner/progress-spinner.component";

@NgModule({
    declarations: [
        ProgressSpinnerComponent
    ],
    exports: [
        ProgressSpinnerComponent
    ],
    imports: [
        MatProgressSpinnerModule
    ]
})
export class SharedModule {}
