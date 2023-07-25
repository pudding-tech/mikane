import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import localeNo from '@angular/common/locales/no';
import { LOCALE_ID, enableProdMode, importProvidersFrom } from '@angular/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { AuthInterceptor } from './app/services/auth/auth.interceptor';
import { environment } from './environments/environment';

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
			MatSnackBarModule
		),
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
		provideAnimations(),
		provideHttpClient(withInterceptorsFromDi()),
	],
}).catch((err) => console.error(err));
