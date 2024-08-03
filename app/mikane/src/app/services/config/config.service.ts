import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENV } from 'src/environments/environment.provider';
import { Environment } from 'src/environments/environment.interface';

export interface Config {
	id: number;
  name: string;
  value: string;
  description: string;
}

@Injectable({
	providedIn: 'root'
})
export class ConfigService {
	private apiUrl = this.env.apiUrl + 'config';

	constructor(private httpClient: HttpClient, @Inject(ENV) private env: Environment) {}

	getConfig() {
		return this.httpClient.get<Config[]>(this.apiUrl);
	}
}
