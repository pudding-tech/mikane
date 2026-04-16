import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { LogService } from './log.service';

@Injectable({
	providedIn: 'root',
})
export class MikaneErrorHandler implements ErrorHandler {
	private logService = inject(LogService);

	handleError(error: Error | HttpErrorResponse): void {
		this.logService.error(error);
	}
}
