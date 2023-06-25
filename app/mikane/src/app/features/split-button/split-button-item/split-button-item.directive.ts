import { Directive, TemplateRef } from '@angular/core';

@Directive({
	selector: '[splitButtonItem]',
	standalone: true,
})
export class SplitButtonItemDirective {
	constructor(public templateRef: TemplateRef<any>) {}
}
