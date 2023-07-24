import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Route, Router } from '@angular/router';
import { EMPTY, catchError, of, switchMap } from 'rxjs';
import { ContextService } from 'src/app/services/context/context.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { RegisterUserComponent } from './register-user.component';

const registerResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
	const router = inject(Router);
	const userService = inject(UserService);
	const environment = inject(ContextService).environment;
	const messageService = inject(MessageService);
	const key = route.paramMap.get('key');

	if (environment === 'dev') {
		return of('');
	} else if (!key) {
		router.navigate(['/login']);
		return EMPTY;
	} else {
		return userService.verifyRegisterKey(key).pipe(
			switchMap(() => {
				return of(key);
			}),
			catchError((err: ApiError) => {
				if (err.error.code === 'PUD-101') {
					messageService.showError('Invalid or expired key');
					router.navigate(['/login']);
					return EMPTY;
				} else {
					messageService.showError('Failed to validate key');
					console.error('something went wrong while validating user registration key', err);
					router.navigate(['/login']);
					return EMPTY;
				}
			})
		);
	}
};

export default [
	{ path: '', component: RegisterUserComponent, resolve: { key: registerResolver } },
	{ path: ':key', component: RegisterUserComponent, resolve: { key: registerResolver } },
] as Route[];
