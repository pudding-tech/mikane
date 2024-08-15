import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';

@Injectable({
	providedIn: 'root',
})
export class KeyValidationService {
	private httpClient = inject(HttpClient);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl + 'verifykey';

	verifyRegisterKey(key: string): Observable<{ firstName?: string; lastName?: string; email: string }> {
		return this.httpClient.get<{ firstName?: string; lastName?: string; email: string }>(this.apiUrl + '/register/' + key);
	}

	verifyDeleteAccountKey(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/deleteaccount/' + key);
	}

	verifyPasswordReset(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/passwordreset/' + key);
	}
}
