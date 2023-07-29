import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, of, switchMap, timer } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';

export function usernameValidator(formValidationService: FormValidationService, userId?: string): AsyncValidatorFn {
	return (control: AbstractControl): Observable<ValidationErrors> | null => {
		return timer(1000).pipe(
			switchMap(() => {
				return formValidationService.validateUsername(control.value, userId);
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
