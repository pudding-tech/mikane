import { fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { usernameValidator } from './async-username.validator';

describe('usernameValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		formValidationService = jasmine.createSpyObj<FormValidationService>('FormValidationService', ['validateUsername']);
	});

	it('should return null if username is valid', fakeAsync(() => {
		const control = new FormControl('test');
		(formValidationService.validateUsername as jasmine.Spy).and.returnValue(of(null));

		const validator = usernameValidator(formValidationService)!(control) as Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator.subscribe((res) => (result = res));
		tick(1000);
		expect(result).toBeNull();
	}));

	it('should return { duplicate: true } if username is already taken', fakeAsync(() => {
		const control = new FormControl('test');
		const error: ApiError = { status: 409 } as ApiError;
		(formValidationService.validateUsername as jasmine.Spy).and.returnValue(throwError(() => error));

		const validator = usernameValidator(formValidationService)!(control) as Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator.subscribe((res) => (result = res));
		tick(1000);
		expect(result).toEqual({ duplicate: true });
	}));

	it('should return { invalid: true } if username is invalid', fakeAsync(() => {
		const control = new FormControl('test');
		const error: ApiError = { status: 400 } as ApiError;
		(formValidationService.validateUsername as jasmine.Spy).and.returnValue(throwError(() => error));

		const validator = usernameValidator(formValidationService)!(control) as Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator.subscribe((res) => (result = res));
		tick(1000);
		expect(result).toEqual({ invalid: true });
	}));

	it('should debounce validation by 1000ms', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['value'], { value: 'test' });
		(formValidationService.validateUsername as jasmine.Spy).and.returnValue(of(null));

		const validator = usernameValidator(formValidationService)!(control);
		const startTime = Date.now();
		(validator as Observable<ValidationErrors | null>).subscribe(() => {
			const endTime = Date.now();
			expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
		});

		tick(500);
		expect(formValidationService.validateUsername).not.toHaveBeenCalled();
		tick(500);
		expect(formValidationService.validateUsername).toHaveBeenCalled();
	}));

	it('should pass userId to formValidationService if provided', fakeAsync(() => {
		const control = jasmine.createSpyObj<AbstractControl>('AbstractControl', ['value'], { value: 'test' });
		const userId = '123';
		(formValidationService.validateUsername as jasmine.Spy).and.returnValue(of(null));

		const validator = usernameValidator(formValidationService, userId)!(control);
		(validator as Observable<ValidationErrors | null>).subscribe(() => {
			expect(formValidationService.validateUsername).toHaveBeenCalledWith(control.value, userId);
		});

		tick(1000);
	}));
});
