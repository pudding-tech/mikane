import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emailValidator } from './async-email.validator';

describe('asyncEmailValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: FormValidationService,
					useValue: {
						validateEmail: vi.fn(),
					},
				},
			],
		});

		formValidationService = TestBed.inject(FormValidationService);
	});

	it('should return null if email is valid', () => {
		const control = new FormControl('test@example.com');
		vi.spyOn(formValidationService, 'validateEmail').mockReturnValue(of(null));
		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toBeNull();
	});

	it('should return { duplicate: true } if email is already taken', () => {
		const control = new FormControl('test@example.com');
		vi.spyOn(formValidationService, 'validateEmail').mockReturnValue(
			throwError(() => {
				throw { status: 409 } as ApiError;
			}),
		);

		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ duplicate: true });
	});

	it('should return { invalid: true } if email is invalid', () => {
		const control = new FormControl('invalid-email');
		vi.spyOn(formValidationService, 'validateEmail').mockReturnValue(
			throwError(() => {
				throw { status: 400 } as ApiError;
			}),
		);

		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ invalid: true });
	});

	it('should debounce validation by 1000ms', () => {
		const control = new FormControl('test@example.com');
		vi.spyOn(formValidationService, 'validateEmail').mockReturnValue(of(null));
		const validator = emailValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		const startTime = Date.now();
		validator(control).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
		});

		vi.runAllTimers();
	});

	it('should pass userId to formValidationService if provided', () => {
		const control = new FormControl('test@example.com');
		const userId = '123';
		const validator = emailValidator(formValidationService, userId) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.spyOn(formValidationService, 'validateEmail').mockReturnValue(of(null));

		vi.useFakeTimers();
		validator(control).subscribe();
		vi.runAllTimers();

		expect(formValidationService.validateEmail).toHaveBeenCalledWith(control.value, userId);
	});
});
