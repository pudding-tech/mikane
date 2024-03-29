import { TestBed } from '@angular/core/testing';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { ContextService } from './context.service';

describe('ContextService', () => {
	let service: ContextService;
	let env: Environment;

	beforeEach(() => {
		env = {
			production: false,
		} as Environment;

		TestBed.configureTestingModule({ providers: [{ provide: ENV, useValue: env }] });
	});

	describe('#isMobileDevice', () => {
		it('should return false if there is no user agent', () => {
			spyOnProperty(window.navigator, 'userAgent').and.returnValue(undefined);
			service = TestBed.inject(ContextService);

			expect(service.isMobileDevice).toBe(false);
		});

		it('should return true if the user agent matches a mobile device', () => {
			spyOnProperty(window.navigator, 'userAgent').and.returnValue('android');
			service = TestBed.inject(ContextService);

			expect(service.isMobileDevice).toBe(true);
		});

		it('should return false if user agent does not match a mobile device', () => {
			spyOnProperty(window.navigator, 'userAgent').and.returnValue('Mozilla');
			service = TestBed.inject(ContextService);

			expect(service.isMobileDevice).toBe(false);
		});
	});

	describe('#isIos', () => {
		it('should return false when there is no user agent', () => {
			spyOnProperty(window.navigator, 'userAgent').and.returnValue(undefined);
			service = TestBed.inject(ContextService);

			expect(service.isIos).toBe(false);
		});

		it('should return true if device is iOS', () => {
			const spy = spyOnProperty(window.navigator, 'userAgent');

			['iPad', 'iPhone', 'iPod'].forEach((userAgent) => {
				spy.and.returnValue(userAgent);
				service = TestBed.inject(ContextService);

				expect(service.isIos).toBe(true);
			});
		});
	});

	describe('#environment', () => {
		it('should return correct environment if dev', () => {
			service = TestBed.inject(ContextService);

			expect(service.environment).toBe('dev');
		});

		it('should return correct environment if prod', () => {
			env.production = true;
			service = TestBed.inject(ContextService);

			expect(service.environment).toBe('prod');
		});
	});
});
