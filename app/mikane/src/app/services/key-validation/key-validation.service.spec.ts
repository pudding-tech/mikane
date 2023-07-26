import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { KeyValidationService } from './key-validation.service';

describe('KeyValidationService', () => {
	let service: KeyValidationService;
	let httpTestingController: HttpTestingController;

	beforeEach(() => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
		TestBed.configureTestingModule({
			providers: [KeyValidationService, { provide: ENV, useValue: env }],
			imports: [HttpClientTestingModule],
		});
		service = TestBed.inject(KeyValidationService);

		// Inject the http service and test controller for each test
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	describe('#verifyRegisterKey', () => {
		it('should send verification key', () => {
			service.verifyRegisterKey('key').subscribe({
				next: (email) => expect(email).withContext('should return email').toEqual({ email: 'test@test.test' }),
				error: fail,
			});

			const req = httpTestingController.expectOne('http://localhost:3002/api/verifykey/register/key');
			expect(req.request.method).toEqual('GET');

			req.flush({ email: 'test@test.test' });
		});
	});

	describe('#verifyDeleteAccountKey', () => {
		it('should send verification key', () => {
			service.verifyDeleteAccountKey('key').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/verifykey/deleteaccount/key');
			expect(req.request.method).toEqual('GET');

			req.flush({});
		});
	});

	describe('#verifyPasswordReset', () => {
		it('should send verification key', () => {
			service.verifyPasswordReset('key').subscribe({ error: fail });

			const req = httpTestingController.expectOne('http://localhost:3002/api/verifykey/passwordreset/key');
			expect(req.request.method).toEqual('GET');

			req.flush({});
		});
	});
});
