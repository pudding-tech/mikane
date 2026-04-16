import packageJson from '../../package.json';
import { Environment } from './environment.interface';

export const environment: Environment = {
	production: true,
	apiUrl: 'https://api.mikane.no/api/',
	version: packageJson.version,
};
