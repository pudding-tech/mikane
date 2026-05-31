import packageJson from '../../package.json';
import { Environment } from './environment.interface';

export const environment: Environment & { mock: boolean } = {
	production: false,
	apiUrl: '/api/',
	version: packageJson.version,
	mock: true,
};
