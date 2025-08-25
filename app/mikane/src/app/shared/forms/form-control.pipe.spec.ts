import { AbstractControl, FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { FormControlPipe } from './form-control.pipe';

describe('FormControlPipe', () => {
	const pipe = new FormControlPipe();

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should transform AbstractControl to FormControl', () => {
		const transformedControl = pipe.transform(new FormControl() as AbstractControl);

		expect(transformedControl instanceof FormControl).toBeTruthy();
	});
});
