import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const loggedInGuard: CanActivateFn = () => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.getCurrentUser().pipe(
		map((user) => {
			if (user) {
				// User is already logged in, redirect to events list
				return router.parseUrl('/events');
			} else {
				return true;
			}
		}),
		catchError(() => {
			return of(true);
		})
	);
};
