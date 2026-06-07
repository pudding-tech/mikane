import { AsyncValidatorFn } from '@angular/forms';
import { FormValidationService } from '../../../services/form-validation/form-validation.service';
import { createUniquenessValidator } from './uniqueness-validator';

export function usernameValidator(formValidationService: FormValidationService, userId?: string): AsyncValidatorFn {
	return createUniquenessValidator((value) => formValidationService.validateUsername(value, userId));
}
