import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';

export interface Currency {
	code: string;
	name: string;
}

@Injectable({
	providedIn: 'root',
})
export class CurrencyService {
	private httpClient = inject(HttpClient);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl + 'currencies';

	loadCurrencies(): Observable<Currency[]> {
		return this.httpClient.get<Currency[]>(this.apiUrl);
	}
}
