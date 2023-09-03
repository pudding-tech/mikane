import { AbstractControl, FormControl } from '@angular/forms';
import { createCompareValidator } from './compare.validator';

fdescribe('createCompareValidator', () => {
	let controlOne: AbstractControl;
	let controlTwo: AbstractControl;

	beforeEach(() => {
		controlOne = new FormControl('password');
		controlTwo = new FormControl('password');
	});

	it('should return null if control values match', () => {
		const validator = createCompareValidator(controlOne, controlTwo)!();
		expect(validator).toBeNull();
		expect(controlTwo.errors).toBeNull();
	});

	it('should return { match_error: "Passwords do not match" } if control values do not match', () => {
		controlTwo.setValue('different password');
		const validator = createCompareValidator(controlOne, controlTwo)!();
		expect(validator).toEqual({ match_error: 'Passwords do not match' });
		expect(controlTwo.errors).toEqual({ match_error: 'Passwords do not match' });
	});

	it('should return null if control values are undefined', () => {
		controlOne.setValue(undefined);
		controlTwo.setValue(undefined);
		const validator = createCompareValidator(controlOne, controlTwo)!();
		expect(validator).toBeNull();
		expect(controlTwo.errors).toBeNull();
	});

	it('should return null if control values are null', () => {
		controlOne.setValue(null);
		controlTwo.setValue(null);
		const validator = createCompareValidator(controlOne, controlTwo)!();
		expect(validator).toBeNull();
		expect(controlTwo.errors).toBeNull();
	});
});
