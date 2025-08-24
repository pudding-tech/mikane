import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { FormValidationService } from './form-validation.service';

describe('FormValidationService', () => {
	let service: FormValidationService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;

		TestBed.configureTestingModule({
			providers: [
				FormValidationService,
				{ provide: ENV, useValue: env },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});

		service = TestBed.inject(FormValidationService);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	describe('#validateUsername', () => {
		it('should validate username', () => {
			service.validateUsername('username').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual({ valid: true });
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/validation/user/username');

			expect(req.request.method).toEqual('POST');

			req.flush({ valid: true });
		});
	});

	describe('#validateEmail', () => {
		it('should validate email', () => {
			service.validateEmail('email').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual({ valid: true });
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/validation/user/email');

			expect(req.request.method).toEqual('POST');

			req.flush({ valid: true });
		});
	});

	describe('#validatePhone', () => {
		it('should validate phone', () => {
			service.validatePhone('phone').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual({ valid: true });
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/validation/user/phone');

			expect(req.request.method).toEqual('POST');

			req.flush({ valid: true });
		});
	});

	describe('#validateEventName', () => {
		it('should validate event name', () => {
			service.validateEventName('name').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual({ valid: true });
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/validation/event/name');

			expect(req.request.method).toEqual('POST');
		});
	});

	describe('#validateCategoryName', () => {
		it('should validate category name', () => {
			service.validateCategoryName('name', 'eventId').subscribe({
				next: (result) => {
					expect(result).withContext('should return result').toEqual({ valid: true });
				},
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/validation/category/name');

			expect(req.request.method).toEqual('POST');
		});
	});
});
