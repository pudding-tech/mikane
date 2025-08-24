import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { vi } from 'vitest';
import { phoneValidator } from './async-phone.validator';

describe('phoneValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: FormValidationService,
					useValue: {
						validatePhone: vi.fn(),
					},
				},
			],
		});

		formValidationService = TestBed.inject(FormValidationService);
	});

	it('should return null if phone number is valid', () => {
		const control = new FormControl('1234567890');
		vi.spyOn(formValidationService, 'validatePhone').mockReturnValue(of(null));
		const validator = phoneValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toBeNull();
	});

	it('should return { duplicate: true } if phone number is already taken', () => {
		const control = new FormControl('duplicate-phone');
		vi.spyOn(formValidationService, 'validatePhone').mockReturnValue(
			throwError(() => {
				throw { status: 409 } as ApiError;
			}),
		);

		const validator = phoneValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ duplicate: true });
	});

	it('should return { invalid: true } if phone number is invalid', () => {
		const control = new FormControl('invalid-phone');
		vi.spyOn(formValidationService, 'validatePhone').mockReturnValue(
			throwError(() => {
				throw { status: 400 } as ApiError;
			}),
		);

		const validator = phoneValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ invalid: true });
	});

	it('should debounce validation by 500ms', () => {
		const control = new FormControl('1234567890');
		vi.spyOn(formValidationService, 'validatePhone').mockReturnValue(of(null));
		const validator = phoneValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		const startTime = Date.now();
		validator(control).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(500);
		});

		vi.runAllTimers();
	});

	it('should pass userId to formValidationService if provided', () => {
		const control = new FormControl('1234567890');
		const userId = '123';
		vi.spyOn(formValidationService, 'validatePhone').mockReturnValue(of(null));
		const validator = phoneValidator(formValidationService, userId) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();
		validator(control).subscribe();
		vi.runAllTimers();

		expect(formValidationService.validatePhone).toHaveBeenCalledWith('1234567890', userId);
	});
});
