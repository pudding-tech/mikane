import { InjectionToken } from "@angular/core";
// import { Config } from "./services/config/config.service";

const APP_CONFIG = {
	CURRENCY_CODE: ''
};

export const APP_CONFIG_TOKEN = new InjectionToken('app.config', {
	providedIn: 'root',
	factory: () => APP_CONFIG
});
