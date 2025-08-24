import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usernameValidator } from './async-username.validator';

describe('usernameValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: FormValidationService,
					useValue: {
						validateUsername: vi.fn(),
					},
				},
			],
		});

		formValidationService = TestBed.inject(FormValidationService);
	});

	it('should return null if username is valid', () => {
		const control = new FormControl('valid-username');
		vi.spyOn(formValidationService, 'validateUsername').mockReturnValue(of(null));
		const validator = usernameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toBeNull();
	});

	it('should return { duplicate: true } if username is already taken', () => {
		const control = new FormControl('duplicate-username');
		vi.spyOn(formValidationService, 'validateUsername').mockReturnValue(
			throwError(() => {
				throw { status: 409 } as ApiError;
			}),
		);

		const validator = usernameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ duplicate: true });
	});

	it('should return { invalid: true } if username is invalid', () => {
		const control = new FormControl('invalid-username');
		vi.spyOn(formValidationService, 'validateUsername').mockReturnValue(
			throwError(() => {
				throw { status: 400 } as ApiError;
			}),
		);

		const validator = usernameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ invalid: true });
	});

	it('should debounce validation by 1000ms', () => {
		const control = new FormControl('valid-username');
		vi.spyOn(formValidationService, 'validateUsername').mockReturnValue(of(null));
		const validator = usernameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		const startTime = Date.now();
		validator(control).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
		});

		vi.runAllTimers();
	});

	it('should pass userId to formValidationService if provided', () => {
		const control = new FormControl('valid-username');
		const userId = '123';
		vi.spyOn(formValidationService, 'validateUsername').mockReturnValue(of(null));
		const validator = usernameValidator(formValidationService, userId) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();
		validator(control).subscribe();
		vi.runAllTimers();

		expect(formValidationService.validateUsername).toHaveBeenCalledWith('valid-username', userId);
	});
});
