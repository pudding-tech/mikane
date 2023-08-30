import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Route, Router } from '@angular/router';
import { EMPTY, catchError, of, switchMap } from 'rxjs';
import { ContextService } from 'src/app/services/context/context.service';
import { KeyValidationService } from 'src/app/services/key-validation/key-validation.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { RegisterUserComponent } from './register-user.component';

const registerResolver: ResolveFn<{ key: string; user: { firstName?: string; lastName?: string; email: string } }> = (
	route: ActivatedRouteSnapshot
) => {
	const router = inject(Router);
	const keyValidationService = inject(KeyValidationService);
	const environment = inject(ContextService).environment;
	const messageService = inject(MessageService);
	const key = route.paramMap.get('key');

	if (environment === 'dev') {
		return of({ key: key, user: { email: '' } });
	} else if (!key) {
		router.navigate(['/login']);
		return EMPTY;
	} else {
		return keyValidationService.verifyRegisterKey(key).pipe(
			switchMap((user: { firstName?: string; lastName?: string; email?: string }) => {
				return of({ key, user: { firstName: user?.firstName, lastName: user?.lastName, email: user?.email } });
			}),
			catchError((err: ApiError) => {
				if (err.error.code === 'PUD-101') {
					messageService.showError('Invalid or expired key!');
					router.navigate(['/login']);
					return EMPTY;
				} else {
					messageService.showError('Failed to validate key!');
					console.error('something went wrong while validating user registration key', err);
					router.navigate(['/login']);
					return EMPTY;
				}
			})
		);
	}
};

export default [
	{ path: '', component: RegisterUserComponent, resolve: { res: registerResolver } },
	{ path: ':key', component: RegisterUserComponent, resolve: { res: registerResolver } },
] as Route[];
