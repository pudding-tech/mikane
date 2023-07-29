import { InjectionToken } from '@angular/core';
import { environment } from './environment';
import { Environment } from './environment.interface';

export const ENV = new InjectionToken<Environment>('env');

export function getEnv(): Environment {
	return environment;
}
