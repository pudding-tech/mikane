import { TestBed } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { categoryNameValidator } from './async-category-name.validator';

describe('categoryNameValidator', () => {
	let formValidationService: FormValidationService;
	let eventId: string;
	let categoryId: string;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: FormValidationService,
					useValue: {
						validateCategoryName: vi.fn(),
					},
				},
			],
		});

		formValidationService = TestBed.inject(FormValidationService);
		eventId = '1';
		categoryId = '1';
	});

	it('should throw error if eventId is not supplied', () => {
		expect(() => categoryNameValidator(formValidationService, null, categoryId)).toThrowError(
			'eventId not supplied while initializing validator',
		);
	});

	it('should return null if no error', () => {
		const control = new FormControl('categoryName');
		const validator = categoryNameValidator(formValidationService, eventId, categoryId) as (
			control: FormControl,
		) => Observable<ValidationErrors | null>;
		vi.spyOn(formValidationService, 'validateCategoryName').mockReturnValue(of(null));

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		vi.runAllTimers();

		expect(result).toBeNull();
	});

	it('should return duplicate error if 409', () => {
		const control = new FormControl('categoryName');
		const validator = categoryNameValidator(formValidationService, eventId, categoryId) as (
			control: FormControl,
		) => Observable<ValidationErrors | null>;
		vi.spyOn(formValidationService, 'validateCategoryName').mockReturnValue(
			throwError(() => {
				throw { status: 409 } as ApiError;
			}),
		);

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		vi.runAllTimers();

		expect(result).toEqual({ duplicate: true });
	});

	it('should return invalid error if not 409', () => {
		const control = new FormControl('categoryName');
		const validator = categoryNameValidator(formValidationService, eventId, categoryId) as (
			control: FormControl,
		) => Observable<ValidationErrors | null>;
		vi.spyOn(formValidationService, 'validateCategoryName').mockReturnValue(
			throwError(() => {
				throw { status: 500 } as ApiError;
			}),
		);

		vi.useFakeTimers();

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		vi.runAllTimers();

		expect(result).toEqual({ invalid: true });
	});
});
