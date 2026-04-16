import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.getCurrentUser().pipe(
		map((user) => {
			if (user) {
				return true;
			} else {
				// User is not logged in, save URL and redirect to login page
				authService.redirectUrl = state.url;
				return router.parseUrl('/login');
			}
		}),
		catchError(() => {
			// User is not logged in, save URL and redirect to login page
			authService.redirectUrl = state.url;
			return of(router.parseUrl('/login'));
		}),
	);
};
