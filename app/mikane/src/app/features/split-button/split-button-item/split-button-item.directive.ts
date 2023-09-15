import { Directive, TemplateRef } from '@angular/core';
import { SplitButtonItemComponent } from './split-button-item.component';

@Directive({
	selector: '[appSplitButtonItem]',
	standalone: true,
})
export class SplitButtonItemDirective {
	constructor(public templateRef: TemplateRef<SplitButtonItemComponent>) {}
}
