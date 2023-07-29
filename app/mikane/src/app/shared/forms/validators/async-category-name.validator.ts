import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, of, switchMap, timer } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';

export function categoryNameValidator(
	formValidationService: FormValidationService,
	eventId: string,
	categoryId?: string
): AsyncValidatorFn {
	if (!eventId) {
		throw new Error('eventId not supplied while initializing validator');
	}
	return (control: AbstractControl): Observable<ValidationErrors | null> => {
		return timer(500).pipe(
			switchMap(() => {
				return formValidationService.validateCategoryName(control.value, eventId, categoryId);
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
