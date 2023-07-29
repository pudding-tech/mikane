import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { ExpenseService } from './expense.service';

describe('ExpenseService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [ExpenseService, { provide: ENV, useValue: {} as Environment }],
		});
	});

	it('should be created', () => {
		const service = TestBed.inject(ExpenseService);
		expect(service).toBeTruthy();
	});
});
