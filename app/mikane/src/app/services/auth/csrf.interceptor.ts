import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, NEVER, Observable, switchMap, take, throwError, timeout, TimeoutError } from 'rxjs';
import { MessageService } from '../message/message.service';
import { AuthService } from './auth.service';

/**
 * Upper bound for how long we wait for a CSRF token
 */
const CSRF_TOKEN_WAIT_MS = 5_000;

export function csrfInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	const authService = inject(AuthService);
	const router = inject(Router);
	const messageService = inject(MessageService);

	if (authService.authenticated) {
		return authService.csrfToken$.pipe(
			filter((token) => !!token),
			take(1),
			timeout(CSRF_TOKEN_WAIT_MS),
			catchError((error) => {
				if (error instanceof TimeoutError) {
					// force re-auth if no token arrives
					messageService.showError('Could not authenticate, please log in again.');
					authService.redirectUrl = router.url;
					authService.logout().subscribe({ error: () => undefined });
					router.navigate(['/login']);
					return NEVER;
				}
				return throwError(() => error);
			}),
			switchMap((token) => {
				req = req.clone({
					setHeaders: {
						'X-XSRF-TOKEN': token,
					},
				});

				return next(req).pipe(
					catchError((error) => {
						if (error.status === 403 && error?.error?.code === 'PUD-148') {
							messageService.showError('CSRF Token invalid, please log in again.');
							authService.redirectUrl = router.url;
							authService.logout().subscribe();
							router.navigate(['/login']);
							return NEVER;
						}
						return throwError(() => error);
					}),
				);
			}),
		);
	} else {
		return next(req);
	}
}
