import { AsyncValidatorFn } from '@angular/forms';
import { FormValidationService } from '../../../services/form-validation/form-validation.service';
import { createUniquenessValidator } from './uniqueness-validator';

export function categoryNameValidator(
	formValidationService: FormValidationService,
	eventId: string,
	categoryId?: string,
): AsyncValidatorFn {
	if (!eventId) {
		throw new Error('eventId not supplied while initializing validator');
	}
	return createUniquenessValidator((value) => formValidationService.validateCategoryName(value, eventId, categoryId));
}
