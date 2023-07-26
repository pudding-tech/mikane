import { HttpClient } from '@angular/common/http';

import { Environment } from 'src/environments/environment.interface';
import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let httpClientStub: HttpClient;
	let env = {} as Environment;

	beforeEach(() => {
		httpClientStub = {} as HttpClient;
		service = new UserService(httpClientStub, env);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
