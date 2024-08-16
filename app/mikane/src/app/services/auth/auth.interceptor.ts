import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, Observable, catchError, throwError } from 'rxjs';
import { MessageService } from '../message/message.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	private router = inject(Router);
	private authService = inject(AuthService);
	private messageService = inject(MessageService);


	intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		req = req.clone({
			withCredentials: true,
		});

		return next.handle(req).pipe(
			catchError((error) => {
				if (error?.status === 401 && error?.error?.code === 'PUD-000') {
					// Login check allowed, used by route guards
					return throwError(() => error);
				} else if (error?.status === 401 && error?.error?.code !== 'PUD-003') {
					// User is not authorized, redirecting to login page
					this.authService.redirectUrl = this.router.url;
					this.authService.clearCurrentUser();
					this.router.navigate(['/login']);
					return NEVER;
				} else if (error?.status === 403 && error?.error?.code === 'PUD-138') {
					// User is trying to access a private event without authorization, redirect to events page
					this.messageService.showError('You are not authorized to view this private event');
					this.router.navigate(['/events']);
					return NEVER;
				} else {
					return throwError(() => error);
				}
			}),
		);
	}
}
