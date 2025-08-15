import { TestBed } from '@angular/core/testing';
import { LOG_LEVEL, LoggerLevel } from './log-level.config';
import { LogService } from './log.service';

describe('LogService', () => {
	let service: LogService;

	describe('log level TRACE', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				imports: [],
				providers: [LogService, { provide: LOG_LEVEL, useValue: LoggerLevel.TRACE }],
			});
			service = TestBed.inject(LogService);
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
	});

	describe('log level INFO', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				imports: [],
				providers: [LogService, { provide: LOG_LEVEL, useValue: LoggerLevel.INFO }],
			});
			service = TestBed.inject(LogService);
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
