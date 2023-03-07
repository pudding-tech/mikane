import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ExpenseService } from './expense.service';

describe('ExpenseService', () => {
	let httpClient: HttpClient;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [ExpenseService],
		});
		httpClient = TestBed.inject(HttpClient);
	});

	it('should be created', () => {
		const service = TestBed.inject(ExpenseService);
		expect(service).toBeTruthy();
	});
});
