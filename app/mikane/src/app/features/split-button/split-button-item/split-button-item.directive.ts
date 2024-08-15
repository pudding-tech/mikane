import { Directive, TemplateRef, inject } from '@angular/core';
import { SplitButtonItemComponent } from './split-button-item.component';

@Directive({
	selector: '[appSplitButtonItem]',
	standalone: true,
})
export class SplitButtonItemDirective {
	templateRef = inject<TemplateRef<SplitButtonItemComponent>>(TemplateRef);
}
