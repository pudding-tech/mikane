import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { eventNameValidator } from './async-event-name.validator';

describe('eventNameValidator', () => {
	let formValidationService: FormValidationService;

	beforeEach(() => {
		formValidationService = jasmine.createSpyObj('FormValidationService', ['validateEventName']);
	});

	it('should return null if event name is valid', fakeAsync(() => {
		const control = new FormControl('test event');
		(formValidationService.validateEventName as jasmine.Spy).and.returnValue(of(null));

		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator(control).subscribe((res: ValidationErrors | null) => {
			result = res;
		});

		tick(500);

		expect(result).toBeNull();
	}));

	it('should return { duplicate: true } if event name is already taken', fakeAsync(() => {
		const control = new FormControl('test event');
		const error: ApiError = { status: 409 } as ApiError;
		(formValidationService.validateEventName as jasmine.Spy).and.returnValue(throwError(() => error));

		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator(control).subscribe((res: ValidationErrors | null) => {
			result = res;
		});

		tick(500);

		expect(result).toEqual({ duplicate: true });
	}));

	it('should return { invalid: true } if event name is invalid', fakeAsync(() => {
		const control = new FormControl('invalid event name');
		const error: ApiError = { status: 400 } as ApiError;
		(formValidationService.validateEventName as jasmine.Spy).and.returnValue(throwError(() => error));

		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		let result: ValidationErrors | null = null;
		validator(control).subscribe((res: ValidationErrors | null) => {
			result = res;
		});

		tick(500);

		expect(result).toEqual({ invalid: true });
	}));

	it('should debounce validation by 500ms', fakeAsync(() => {
		const control = new FormControl('test event');
		(formValidationService.validateEventName as jasmine.Spy).and.returnValue(of(null));

		const validator = eventNameValidator(formValidationService) as (control: FormControl) => Observable<ValidationErrors | null>;
		const startTime = Date.now();
		validator(control).subscribe(() => {
			const endTime = Date.now();

			expect(endTime - startTime).toBeGreaterThanOrEqual(500);
		});

		tick(500);
	}));

	it('should pass eventId to formValidationService if provided', fakeAsync(() => {
		const control = new FormControl('test event');
		const eventId = '123';
		(formValidationService.validateEventName as jasmine.Spy).and.returnValue(of(null));

		const validator = eventNameValidator(formValidationService, eventId) as (
			control: FormControl
		) => Observable<ValidationErrors | null>;
		validator(control).subscribe(() => {
			expect(formValidationService.validateEventName).toHaveBeenCalledWith(control.value, eventId);
		});

		tick(500);
	}));
});
