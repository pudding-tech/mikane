import { Component, Inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";

@Component({
    templateUrl: './error-message.component.html'
})
export class ErrorMessageComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: string){}
    
}