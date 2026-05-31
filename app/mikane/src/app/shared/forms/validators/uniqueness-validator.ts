import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { ApiError } from 'src/app/types/apiError.type';

/**
 * Default debounce window
 */
export const DEFAULT_VALIDATOR_DELAY_MS = 400;

/**
 * Builds an async uniqueness validator from a check function returning an
 * Observable that errors with HTTP 409 for duplicates.
 *
 * Mapping:
 * - check completes successfully → `null` (valid)
 * - check errors with status 409 → `{ duplicate: true }`
 * - check errors otherwise       → `{ invalid: true }`
 */
export function createUniquenessValidator(
	check: (value: string) => Observable<unknown>,
	options: { delayMs?: number } = {},
): AsyncValidatorFn {
	const delayMs = options.delayMs ?? DEFAULT_VALIDATOR_DELAY_MS;
	return (control: AbstractControl): Observable<ValidationErrors | null> => {
		return timer(delayMs).pipe(
			switchMap(() => check(control.value)),
			map((): ValidationErrors | null => null),
			catchError((err: ApiError) => {
				if (err?.status === 409) {
					return of({ duplicate: true });
				}
				return of({ invalid: true });
			}),
		);
	};
}
