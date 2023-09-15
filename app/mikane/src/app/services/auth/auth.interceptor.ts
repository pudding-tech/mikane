import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NEVER, Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private router: Router, private authService: AuthService) {}

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
				} else {
					return throwError(() => error);
				}
			})
		);
	}
}
