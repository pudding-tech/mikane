import { Directive, Input, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { createUniquenessValidator } from './uniqueness-validator';

export function eventNameValidator(formValidationService: FormValidationService, eventId?: string): AsyncValidatorFn {
	return createUniquenessValidator((value) => formValidationService.validateEventName(value, eventId));
}

@Directive({
	selector: '[appEventName][formControlName], [appEventName][formControl], [appEventName][ngModel]',
	providers: [{ provide: NG_ASYNC_VALIDATORS, useExisting: EventNameValidatorDirective, multi: true }],
	standalone: true,
})
export class EventNameValidatorDirective implements AsyncValidator {
	private validationService = inject(FormValidationService);

	@Input() appEventName: string;

	validate(control: AbstractControl<unknown, unknown>): Promise<ValidationErrors> | Observable<ValidationErrors> {
		const validationFn = eventNameValidator(this.validationService, this.appEventName);
		return validationFn(control);
	}
}
