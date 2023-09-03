import { fakeAsync, tick } from '@angular/core/testing';
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of, throwError } from 'rxjs';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { ApiError } from 'src/app/types/apiError.type';
import { categoryNameValidator } from './async-category-name.validator';

describe('categoryNameValidator', () => {
	let formValidationService: FormValidationService;
	let eventId: string;
	let categoryId: string;

	beforeEach(() => {
		formValidationService = jasmine.createSpyObj('FormValidationService', ['validateCategoryName']);
		eventId = 'eventId';
		categoryId = 'categoryId';
	});

	it('should throw error if eventId is not supplied', () => {
		expect(() => categoryNameValidator(formValidationService, null, categoryId)).toThrowError(
			'eventId not supplied while initializing validator'
		);
	});

	it('should return null if no error', fakeAsync(() => {
		const control = new FormControl('categoryName');
		const validator = categoryNameValidator(formValidationService, eventId, categoryId) as (
			control: FormControl
		) => Observable<ValidationErrors | null>;
		(formValidationService.validateCategoryName as jasmine.Spy).and.returnValue(of(null));

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		tick(500);
		expect(result).toBeNull();
	}));

	it('should return duplicate error if 409', fakeAsync(() => {
		const control = new FormControl('categoryName');
		const validator = categoryNameValidator(formValidationService, eventId, categoryId) as (
			control: FormControl
		) => Observable<ValidationErrors | null>;
		(formValidationService.validateCategoryName as jasmine.Spy).and.returnValue(
			throwError(() => {
				throw { status: 409 } as ApiError;
			})
		);

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		tick(500);
		expect(result).toEqual({ duplicate: true });
	}));

	it('should return invalid error if not 409', fakeAsync(() => {
		const control = new FormControl('categoryName');
		const validator = categoryNameValidator(formValidationService, eventId, categoryId) as (
			control: FormControl
		) => Observable<ValidationErrors | null>;
		(formValidationService.validateCategoryName as jasmine.Spy).and.returnValue(
			throwError(() => {
				throw { status: 500 } as ApiError;
			})
		);

		let result: ValidationErrors | null = null;
		validator(control).subscribe((res) => {
			result = res;
		});

		tick(500);
		expect(result).toEqual({ invalid: true });
	}));
});
