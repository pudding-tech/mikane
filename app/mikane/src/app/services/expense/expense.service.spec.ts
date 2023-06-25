import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ExpenseService } from './expense.service';

describe('ExpenseService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [ExpenseService],
		});
	});

	it('should be created', () => {
		const service = TestBed.inject(ExpenseService);
		expect(service).toBeTruthy();
	});
});
