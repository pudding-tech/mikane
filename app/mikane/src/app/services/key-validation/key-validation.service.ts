import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';

@Injectable({
	providedIn: 'root',
})
export class KeyValidationService {
	private apiUrl = this.env.apiUrl + 'verifykey';

	constructor(private httpClient: HttpClient, @Inject(ENV) private env: Environment) {}

	verifyRegisterKey(key: string): Observable<{ email: string }> {
		return this.httpClient.get<{ email: string }>(this.apiUrl + '/register/' + key);
	}

	verifyDeleteAccountKey(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/deleteaccount/' + key);
	}

	verifyPasswordReset(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/passwordreset/' + key);
	}
}
