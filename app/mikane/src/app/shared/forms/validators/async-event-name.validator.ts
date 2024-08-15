import { Directive, Input, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, NG_ASYNC_VALIDATORS, ValidationErrors } from '@angular/forms';
import { Observable, catchError, of, switchMap, timer } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';

export function eventNameValidator(formValidationService: FormValidationService, eventId?: string): AsyncValidatorFn {
	return (control: AbstractControl): Observable<ValidationErrors> => {
		return timer(500).pipe(
			switchMap(() => {
				return formValidationService.validateEventName(control.value, eventId);
			}),
			switchMap(() => {
				// Did not get error, value is valid
				return of(null);
			}),
			catchError((err: ApiError) => {
				if (err.status === 409) {
					return of({ duplicate: true });
				} else {
					return of({ invalid: true });
				}
			})
		);
	};
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
