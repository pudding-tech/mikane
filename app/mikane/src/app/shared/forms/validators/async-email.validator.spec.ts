import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { emailValidator } from './async-email.validator';

fdescribe('asyncEmailValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		formValidationService = jasmine.createSpyObj('FormValidationService', ['validateEmail']);
	});

	it('should return null if email is valid', fakeAsync(() => {
		const control = new FormControl('test@example.com');
		(formValidationService.validateEmail as jasmine.Spy).and.returnValue(of(null));

		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		tick(1000);
		expect(result).toBeNull();
	}));

	it('should return { duplicate: true } if email is already taken', fakeAsync(() => {
		const control = new FormControl('test@example.com');
		const error: ApiError = { status: 409, error: { code: '', message: 'Email already taken' } };
		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		(formValidationService.validateEmail as jasmine.Spy).and.returnValue(throwError(() => error));

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		tick(1000);
		expect(result).toEqual({ duplicate: true });
	}));

	it('should return { invalid: true } if email is invalid', fakeAsync(() => {
		const control = new FormControl('invalid-email');
		const error: ApiError = { status: 400, error: { code: '', message: 'Invalid email' } };
		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		(formValidationService.validateEmail as jasmine.Spy).and.returnValue(throwError(() => error));

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res: ValidationErrors | null) => {
			result = res;
		});

		tick(1000);
		expect(result).toEqual({ invalid: true });
	}));

	it('should debounce validation by 1000ms', fakeAsync(() => {
		const control = new FormControl('test@example.com');
		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		(formValidationService.validateEmail as jasmine.Spy).and.returnValue(of(null));

		const startTime = Date.now();
		validator(control).subscribe(() => {
			const endTime = Date.now();
			expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
		});

		tick(1000);
	}));

	it('should pass userId to formValidationService if provided', fakeAsync(() => {
		const control = new FormControl('test@example.com');
		const userId = '123';
		const validator = emailValidator(formValidationService, userId) as (control: FormControl) => Observable<ValidationErrors | null>;
		(formValidationService.validateEmail as jasmine.Spy).and.returnValue(of(null));

		validator(control).subscribe(() => {
			expect(formValidationService.validateEmail).toHaveBeenCalledWith(control.value, userId);
		});

		tick(1000);
	}));
});
