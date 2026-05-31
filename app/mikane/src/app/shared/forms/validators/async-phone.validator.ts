import { AsyncValidatorFn } from '@angular/forms';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { createUniquenessValidator } from './uniqueness-validator';

export function phoneValidator(formValidationService: FormValidationService, userId?: string): AsyncValidatorFn {
	return createUniquenessValidator((value) => formValidationService.validatePhone(value, userId));
}
