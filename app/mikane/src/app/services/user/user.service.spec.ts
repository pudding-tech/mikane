import { HttpClient } from '@angular/common/http';

import { UserService } from './user.service';

describe('UserService', () => {
	let service: UserService;
	let httpClientStub: HttpClient;

	beforeEach(() => {
		httpClientStub = {} as HttpClient;
		service = new UserService(httpClientStub);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
