import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeNo from '@angular/common/locales/no';
import { APP_INITIALIZER, DEFAULT_CURRENCY_CODE, LOCALE_ID, enableProdMode, importProvidersFrom } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/services/auth/auth.interceptor';
import { environment } from './environments/environment';
import { ENV, getEnv } from './environments/environment.provider';
import { ConfigService } from './app/services/config/config.service';
import { APP_CONFIG_TOKEN } from './app/config';
import { firstValueFrom, from } from 'rxjs';

registerLocaleData(localeNo);

if (environment.production) {
	enableProdMode();
}

export function initializeApp(configService: ConfigService) {
	return () => firstValueFrom(configService.getConfig()).then(config => {
		console.log(config);
		console.log(config[0].value);
		// (APP_CONFIG_TOKEN as any).useValue = config;
		console.log('APP_CONFIG_TOKEN:');
		console.log(APP_CONFIG_TOKEN);
		(DEFAULT_CURRENCY_CODE as any).useValue = config[0].value;
		console.log('DEFAULT_CURRENCY_TOKEN:');
		console.log(DEFAULT_CURRENCY_CODE);
	});
}

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(
			BrowserModule,
			AppRoutingModule,
			ServiceWorkerModule.register('ngsw-worker.js', {
				enabled: environment.production,
				// Register the ServiceWorker as soon as the application is stable
				// or after 30 seconds (whichever comes first).
				registrationStrategy: 'registerWhenStable:30000',
			}),
			MatSnackBarModule
		),
		{
			provide: APP_INITIALIZER,
			useFactory: initializeApp,
			deps: [ConfigService],
			multi: true,
		},
		{
			provide: LOCALE_ID,
			useValue: 'no',
		},
		{
			provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
			useValue: {
				duration: 2500,
			},
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AuthInterceptor,
			multi: true,
		},
		{
			provide: ENV,
			useFactory: getEnv,
		},
		{
			provide: DEFAULT_CURRENCY_CODE,
			useValue: 'DKK',
		},
		provideAnimations(),
		provideHttpClient(withInterceptorsFromDi()),
	],
}).catch((err) => console.error(err));
