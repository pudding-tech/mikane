import { AsyncValidatorFn } from '@angular/forms';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { createUniquenessValidator } from './uniqueness-validator';

export function emailValidator(formValidationService: FormValidationService, userId?: string): AsyncValidatorFn {
	return createUniquenessValidator((value) => formValidationService.validateEmail(value, userId));
}
