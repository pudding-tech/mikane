import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, Route, Router } from '@angular/router';
import { EMPTY, catchError, of, switchMap } from 'rxjs';
import { KeyValidationService } from 'src/app/services/key-validation/key-validation.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { DeleteAccountComponent } from './delete-account.component';

const deleteResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
	const key = route.paramMap.get('key');
	const keyValidationService = inject(KeyValidationService);
	const router = inject(Router);
	const messageService = inject(MessageService);
	const logService = inject(LogService);

	if (!key) {
		messageService.showError('No key provided!');
		router.navigate(['/events']);
		return EMPTY;
	} else {
		return keyValidationService.verifyDeleteAccountKey(key).pipe(
			switchMap(() => {
				return of(key);
			}),
			catchError((err: ApiError) => {
				if (err?.error?.code === 'PUD-106') {
					messageService.showError('Invalid or expired key!');
					router.navigate(['/events']);
					return EMPTY;
				} else {
					messageService.showError('Failed to validate key!');
					logService.error('something went wrong when validating account deletion key: ' + err);
					router.navigate(['/events']);
					return EMPTY;
				}
			}),
		);
	}
};

export default [
	{ path: '', component: DeleteAccountComponent, resolve: { key: deleteResolver } },
	{ path: ':key', component: DeleteAccountComponent, resolve: { key: deleteResolver } },
] as Route[];
