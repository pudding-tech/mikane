import { TestBed } from '@angular/core/testing';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
	let service: ScrollService;

	beforeEach(async () => {
		service = TestBed.inject(ScrollService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
