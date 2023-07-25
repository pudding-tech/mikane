import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class KeyValidationService {
	private apiUrl = environment.apiUrl + 'verifykey';
	constructor(private httpClient: HttpClient) {}

	verifyRegisterKey(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/register/' + key);
	}

	verifyDeleteAccountKey(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/deleteaccount/' + key);
	}

	verifyPasswordReset(key: string): Observable<void> {
		return this.httpClient.get<void>(this.apiUrl + '/passwordreset/' + key);
	}
}
