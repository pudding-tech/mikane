import { InjectionToken } from '@angular/core';

export const LOG_LEVEL = new InjectionToken<number>('log-level');

export enum LoggerLevel {
	TRACE = 0,
	DEBUG = 1,
	INFO = 2,
	LOG = 3,
	WARN = 4,
	ERROR = 5,
	OFF = 6,
}
