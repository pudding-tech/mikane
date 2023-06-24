import { HttpClient } from '@angular/common/http';

import { CategoryService } from './category.service';

describe('CategoryService', () => {
	let service: CategoryService;
	let httpClientStub: HttpClient;

	beforeEach(() => {
		httpClientStub = {} as HttpClient;
		service = new CategoryService(httpClientStub);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
