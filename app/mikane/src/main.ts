import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeNo from '@angular/common/locales/no';
import { ErrorHandler, LOCALE_ID, enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TitleStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/services/auth/auth.interceptor';
import { MikaneErrorHandler } from './app/services/log/error-handler';
import { LOG_LEVEL, LoggerLevel } from './app/services/log/log-level.config';
import { MikaneTitleStrategy } from './app/services/title-strategy/title-strategy';
import { environment } from './environments/environment';
import { ENV, getEnv } from './environments/environment.provider';

registerLocaleData(localeNo);

if (environment.production) {
	enableProdMode();
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
			MatSnackBarModule,
		),
		{
			provide: ErrorHandler,
			useClass: MikaneErrorHandler,
		},
		{
			provide: TitleStrategy,
			useClass: MikaneTitleStrategy,
		},
		{
			provide: LOG_LEVEL,
			useValue: LoggerLevel.INFO,
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
		provideAnimations(),
		provideHttpClient(withInterceptorsFromDi()),
		provideZonelessChangeDetection(),
	],
}).catch((err) => console.error(err));
