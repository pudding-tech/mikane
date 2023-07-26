import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { EventService } from './event.service';

describe('EventService', () => {
	let service: EventService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [{ provide: ENV, useValue: {} as Environment }],
			imports: [HttpClientTestingModule],
		});
		service = TestBed.inject(EventService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
