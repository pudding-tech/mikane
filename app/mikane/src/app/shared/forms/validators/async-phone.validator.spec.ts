import { fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { phoneValidator } from './async-phone.validator';

describe('phoneValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		formValidationService = jasmine.createSpyObj('FormValidationService', ['validatePhone']);
	});

	it('should return null if phone number is valid', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['setValue']);
		control.setValue('1234567890');
		(formValidationService.validatePhone as jasmine.Spy).and.returnValue(of(null));

		const validator = phoneValidator(formValidationService)(control) as Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator.subscribe((res) => (result = res));
		tick(500);

		expect(result).toBeNull();
	}));

	it('should return { duplicate: true } if phone number is already taken', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['value'], { value: '1234567890' });
		const error: ApiError = { status: 409 } as ApiError;
		(formValidationService.validatePhone as jasmine.Spy).and.returnValue(throwError(() => error));

		const validator = phoneValidator(formValidationService)(control) as Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator.subscribe((res) => (result = res));
		tick(500);

		expect(result).toEqual({ duplicate: true });
	}));

	it('should return { invalid: true } if phone number is invalid', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['value'], { value: 'invalid phone number' });
		const error: ApiError = { status: 400 } as ApiError;
		(formValidationService.validatePhone as jasmine.Spy).and.returnValue(throwError(() => error));

		const validator = phoneValidator(formValidationService)(control) as Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator.subscribe((res) => (result = res));
		tick(500);

		expect(result).toEqual({ invalid: true });
	}));

	it('should debounce validation by 500ms', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['value'], { value: '1234567890' });
		(formValidationService.validatePhone as jasmine.Spy).and.returnValue(of(null));

		const validator = phoneValidator(formValidationService)(control);
		const startTime = Date.now();
		(validator as Observable<ValidationErrors>).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(500);
		});

		tick(250);

		expect(formValidationService.validatePhone).not.toHaveBeenCalled();
		tick(250);

		expect(formValidationService.validatePhone).toHaveBeenCalledWith(control.value, undefined);
	}));

	it('should pass userId to formValidationService if provided', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['value'], { value: '1234567890' });
		const userId = '123';
		(formValidationService.validatePhone as jasmine.Spy).and.returnValue(of(null));

		const validator = phoneValidator(formValidationService, userId)(control);
		const startTime = Date.now();
		(validator as Observable<ValidationErrors>).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(500);
			expect(formValidationService.validatePhone).toHaveBeenCalledWith(control.value, userId);
		});

		tick(500);
	}));
});
