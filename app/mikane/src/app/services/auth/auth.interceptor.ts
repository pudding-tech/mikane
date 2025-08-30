import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, Observable, catchError, throwError } from 'rxjs';
import { MessageService } from '../message/message.service';
import { AuthService } from './auth.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
	const authService = inject(AuthService);
	const router = inject(Router);
	const messageService = inject(MessageService);

	req = req.clone({
		withCredentials: true,
	});

	return next(req).pipe(
		catchError((error) => {
			if (error?.status === 401 && error?.error?.code === 'PUD-000') {
				// Login check allowed, used by route guards
				return throwError(() => error);
			} else if (error?.status === 401 && error?.error?.code !== 'PUD-003') {
				// User is not authorized, redirecting to login page
				authService.redirectUrl = router.url;
				authService.clearCurrentUser();
				router.navigate(['/login']);
				return NEVER;
			} else if (error?.status === 403 && error?.error?.code === 'PUD-138') {
				// User is trying to access a private event without authorization, redirect to events page
				messageService.showError('You are not authorized to view this private event');
				router.navigate(['/events']);
				return NEVER;
			} else {
				return throwError(() => error);
			}
		}),
	);
}
