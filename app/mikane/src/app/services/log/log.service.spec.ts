import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { LOG_LEVEL, LoggerLevel } from './log-level.config';
import { LogService } from './log.service';

describe('LogService', () => {
	let service: LogService;
	let authServiceMock: AuthService;
	let httpTestingController: HttpTestingController;

	describe('log level TRACE', () => {
		beforeEach(() => {
			const env = { apiUrl: 'http://localhost:3000/api/' } as Environment;

			TestBed.configureTestingModule({
				providers: [
					LogService,
					{ provide: LOG_LEVEL, useValue: LoggerLevel.TRACE },
					{ provide: ENV, useValue: env },
					{
						provide: AuthService,
						useValue: {
							authenticated: false,
							authenticated$: of(false),
						},
					},
					provideHttpClient(withInterceptorsFromDi()),
					provideHttpClientTesting(),
				],
			});
			service = TestBed.inject(LogService);
			httpTestingController = TestBed.inject(HttpTestingController);
			authServiceMock = TestBed.inject(AuthService);
		});

		afterEach(() => {
			httpTestingController.verify();
		});

		it('should log error messages', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error');
			service.error('Test error');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Test error');
		});

		it('should log warn messages', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn');
			service.warn('Test warn');

			expect(consoleWarnSpy).toHaveBeenCalledWith('Test warn');
		});

		it('should log info messages', () => {
			const consoleInfoSpy = vi.spyOn(console, 'info');
			service.info('Test info');

			expect(consoleInfoSpy).toHaveBeenCalledWith('Test info');
		});

		it('should log debug messages', () => {
			const consoleDebugSpy = vi.spyOn(console, 'debug');
			service.debug('Test debug');

			expect(consoleDebugSpy).toHaveBeenCalledWith('Test debug');
		});

		it('should log trace messages', () => {
			const consoleTraceSpy = vi.spyOn(console, 'trace');
			service.trace('Test trace');

			expect(consoleTraceSpy).toHaveBeenCalledWith('Test trace');
		});

		it('should send error logs to the server', () => {
			vi.spyOn(authServiceMock, 'authenticated', 'get').mockReturnValue(true);
			vi.spyOn(authServiceMock, 'authenticated$', 'get').mockReturnValue(of(true) as BehaviorSubject<boolean>);

			const logMessage = 'Test error message';
			service.error(logMessage);

			const req = httpTestingController.expectOne('http://localhost:3000/api/log');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ message: logMessage, level: 'error', timestamp: expect.any(Date) });
		});

		it('should not send error logs to the server if not authenticated', () => {
			const logMessage = 'Test error message';
			service.error(logMessage);

			const req = httpTestingController.expectNone('http://localhost:3000/api/log');

			expect(req).toBeUndefined();
		});

		it('should send logs after authentication', () => {
			vi.useFakeTimers();
			vi.runAllTimers();

			const authSubject = new BehaviorSubject<boolean>(false);
			vi.spyOn(authServiceMock, 'authenticated$', 'get').mockReturnValue(authSubject);

			const logMessage = 'Test error message';
			service.error(logMessage);
			vi.runAllTimers();

			httpTestingController.expectNone('http://localhost:3000/api/log');

			vi.spyOn(authServiceMock, 'authenticated', 'get').mockReturnValue(true);
			authSubject.next(true);
			vi.runAllTimers();

			const req = httpTestingController.expectOne('http://localhost:3000/api/log');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ message: logMessage, level: 'error', timestamp: expect.any(Date) });
		});

		it('should transform error object to string', () => {
			vi.spyOn(authServiceMock, 'authenticated', 'get').mockReturnValue(true);
			vi.spyOn(authServiceMock, 'authenticated$', 'get').mockReturnValue(of(true) as BehaviorSubject<boolean>);

			const errorObject = { message: 'Test error message', name: 'TestError' } as Error;
			service.error(errorObject);

			const req = httpTestingController.expectOne('http://localhost:3000/api/log');

			expect(req.request.method).toBe('POST');
			expect(req.request.body).toEqual({ message: 'Test error message', level: 'error', timestamp: expect.any(Date) });
		});
	});

	describe('log level INFO', () => {
		beforeEach(() => {
			const env = { apiUrl: 'http://localhost:3000/api/log' } as Environment;

			TestBed.configureTestingModule({
				providers: [
					LogService,
					{ provide: LOG_LEVEL, useValue: LoggerLevel.INFO },
					{ provide: ENV, useValue: env },
					{
						provide: AuthService,
						useValue: {
							authenticated: false,
							authenticated$: of(false) as BehaviorSubject<boolean>,
						},
					},
					provideHttpClient(withInterceptorsFromDi()),
					provideHttpClientTesting(),
				],
			});

			service = TestBed.inject(LogService);
			httpTestingController = TestBed.inject(HttpTestingController);
		});

		it('should not log trace messages', () => {
			const consoleTraceSpy = vi.spyOn(console, 'trace');

			service.trace('Test trace message');

			expect(consoleTraceSpy).not.toHaveBeenCalled();
		});

		it('should log info level messages', () => {
			const consoleInfoSpy = vi.spyOn(console, 'info');

			service.info('Test info message');

			expect(consoleInfoSpy).toHaveBeenCalledWith('Test info message');
		});
	});
});
