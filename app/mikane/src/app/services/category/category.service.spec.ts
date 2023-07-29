import { HttpClient } from '@angular/common/http';

import { Environment } from 'src/environments/environment.interface';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
	let service: CategoryService;
	let httpClientStub: HttpClient;
	let env: Environment;

	beforeEach(() => {
		env = { apiUrl: '' } as Environment;
		httpClientStub = {} as HttpClient;
		service = new CategoryService(httpClientStub, env);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
