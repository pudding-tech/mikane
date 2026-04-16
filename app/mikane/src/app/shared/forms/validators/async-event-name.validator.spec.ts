import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { eventNameValidator } from './async-event-name.validator';

describe('eventNameValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: FormValidationService,
					useValue: {
						validateEventName: vi.fn(),
					},
				},
			],
		});

		formValidationService = TestBed.inject(FormValidationService);
	});

	it('should return null if event name is valid', () => {
		const control = new FormControl('Valid Event Name');
		vi.spyOn(formValidationService, 'validateEventName').mockReturnValue(of(null));
		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toBeNull();
	});

	it('should return { duplicate: true } if event name is already taken', () => {
		const control = new FormControl('Duplicate Event Name');
		vi.spyOn(formValidationService, 'validateEventName').mockReturnValue(
			throwError(() => {
				throw { status: 409 } as ApiError;
			}),
		);

		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ duplicate: true });
	});

	it('should return { invalid: true } if event name is invalid', () => {
		const control = new FormControl('Invalid Event Name');
		vi.spyOn(formValidationService, 'validateEventName').mockReturnValue(
			throwError(() => {
				throw { status: 400 } as ApiError;
			}),
		);

		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((validationResult) => {
			result = validationResult;
		});

		vi.runAllTimers();

		expect(result).toEqual({ invalid: true });
	});

	it('should debounce validation by 500ms', () => {
		const control = new FormControl('Debounced Event Name');
		vi.spyOn(formValidationService, 'validateEventName').mockReturnValue(of(null));
		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();

		const startTime = Date.now();
		validator(control).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(500);
		});

		vi.runAllTimers();
	});

	it('should pass eventId to formValidationService if provided', () => {
		const control = new FormControl('Event Name');
		const eventId = '123';
		vi.spyOn(formValidationService, 'validateEventName').mockReturnValue(of(null));
		const validator = eventNameValidator(formValidationService, eventId) as (
			control: FormControl,
		) => Observable<ValidationErrors | null>;

		vi.useFakeTimers();
		validator(control).subscribe();
		vi.runAllTimers();

		expect(formValidationService.validateEventName).toHaveBeenCalledWith('Event Name', eventId);
	});
});
