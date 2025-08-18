import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { AuthService } from '../auth/auth.service';
import { LOG_LEVEL, LoggerLevel } from './log-level.config';
import { LogService } from './log.service';

describe('LogService', () => {
	let service: LogService;
	let authServiceMock: jasmine.SpyObj<AuthService>;
	let httpTestingController: HttpTestingController;

	describe('log level TRACE', () => {
		beforeEach(() => {
			authServiceMock = jasmine.createSpyObj('AuthService', [], { authenticated: false, authenticated$: of(false) });

			const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
			TestBed.configureTestingModule({
				imports: [],
				providers: [
					LogService,
					{ provide: LOG_LEVEL, useValue: LoggerLevel.TRACE },
					{ provide: ENV, useValue: env },
					{ provide: AuthService, useValue: authServiceMock },
					provideHttpClient(withInterceptorsFromDi()),
					provideHttpClientTesting(),
				],
			});
			service = TestBed.inject(LogService);

			// Inject the http service and test controller for each test
			httpTestingController = TestBed.inject(HttpTestingController);
		});

		afterEach(() => {
			httpTestingController.verify();
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		it('should log error messages', () => {
			const consoleErrorSpy = spyOn(console, 'error');
			service.error('Test error message');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Test error message');
		});

		it('should log warn messages', () => {
			const consoleWarnSpy = spyOn(console, 'warn');
			service.warn('Test warn message');

			expect(consoleWarnSpy).toHaveBeenCalledWith('Test warn message');
		});

		it('should log info messages', () => {
			const consoleInfoSpy = spyOn(console, 'info');
			service.info('Test info message');

			expect(consoleInfoSpy).toHaveBeenCalledWith('Test info message');
		});

		it('should log debug messages', () => {
			const consoleDebugSpy = spyOn(console, 'debug');
			service.debug('Test debug message');

			expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug message');
		});

		it('should log trace messages', () => {
			const consoleTraceSpy = spyOn(console, 'trace');
			service.trace('Test trace message');

			expect(consoleTraceSpy).toHaveBeenCalledWith('Test trace message');
		});

		it('should send error logs to the server', () => {
			(Object.getOwnPropertyDescriptor(authServiceMock, 'authenticated')?.get as jasmine.Spy<() => boolean>).and.returnValue(true);
			(
				Object.getOwnPropertyDescriptor(authServiceMock, 'authenticated$')?.get as jasmine.Spy<() => Observable<boolean>>
			).and.returnValue(of(true));

			const logMessage = 'Test error message';
			service.error(logMessage);

			const req = httpTestingController.expectOne('http://localhost:3002/api/log');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ level: 'error', message: logMessage, timestamp: jasmine.any(Date) });
		});

		it('should not send error logs to the server if not authenticated', () => {
			const logMessage = 'Test error message';
			service.error(logMessage);

			const req = httpTestingController.expectNone('http://localhost:3002/api/log');

			expect(req).toBeUndefined();
		});

		it('should send logs after authentication', fakeAsync(() => {
			tick();

			const authSubject = new BehaviorSubject<boolean>(false);
			(
				Object.getOwnPropertyDescriptor(authServiceMock, 'authenticated$')?.get as jasmine.Spy<() => Observable<boolean>>
			).and.returnValue(authSubject);

			const logMessage = 'Test error message';
			service.error(logMessage);
			tick();

			httpTestingController.expectNone('http://localhost:3002/api/log');

			(Object.getOwnPropertyDescriptor(authServiceMock, 'authenticated')?.get as jasmine.Spy<() => boolean>).and.returnValue(true);
			authSubject.next(true);
			tick();

			const req = httpTestingController.expectOne('http://localhost:3002/api/log');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ level: 'error', message: logMessage, timestamp: jasmine.any(Date) });
		}));

		it('should transform error object to string', () => {
			(Object.getOwnPropertyDescriptor(authServiceMock, 'authenticated')?.get as jasmine.Spy<() => boolean>).and.returnValue(true);
			(
				Object.getOwnPropertyDescriptor(authServiceMock, 'authenticated$')?.get as jasmine.Spy<() => Observable<boolean>>
			).and.returnValue(of(true));

			const errorObject = { message: 'Test error message', name: 'TestError' } as Error;
			service.error(errorObject);

			const req = httpTestingController.expectOne('http://localhost:3002/api/log');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ level: 'error', message: 'Test error message', timestamp: jasmine.any(Date) });
		});
	});

	describe('log level INFO', () => {
		beforeEach(() => {
			const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;

			TestBed.configureTestingModule({
				imports: [],
				providers: [
					LogService,
					{ provide: LOG_LEVEL, useValue: LoggerLevel.INFO },
					{ provide: ENV, useValue: env },
					{ provide: AuthService, useValue: authServiceMock },
					provideHttpClient(withInterceptorsFromDi()),
					provideHttpClientTesting(),
				],
			});
			service = TestBed.inject(LogService);

			// Inject the http service and test controller for each test
			httpTestingController = TestBed.inject(HttpTestingController);
		});

		it('should not log trace messages', () => {
			const consoleTraceSpy = spyOn(console, 'trace');
			service.trace('Test trace message');

			expect(consoleTraceSpy).not.toHaveBeenCalled();
		});

		it('should log error messages with INFO level', () => {
			const consoleErrorSpy = spyOn(console, 'error');
			service.error('Test error message');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Test error message');
		});
	});
});
