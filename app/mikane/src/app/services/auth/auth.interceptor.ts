import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, NEVER, Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private router: Router) {}

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		req = req.clone({
			withCredentials: true,
		});

		return next.handle(req).pipe(
			catchError((error) => {
				if (error?.status === 401 && error?.error?.code !== 'PUD-003') {
					// User is not authorized, redirecting to login page
					this.router.navigate(['/login']);
					return NEVER;
				} else {
					return throwError(() => error);
				}
			})
		);
	}
}
