import { AbstractControl } from '@angular/forms';

export function createCompareValidator(controlOne?: AbstractControl, controlTwo?: AbstractControl) {
	return () => {
		if (controlOne?.value !== controlTwo?.value) {
			controlTwo.setErrors({ match_error: 'Passwords do not match' });
			return { match_error: 'Passwords do not match' };
		}
		return null;
	};
}
