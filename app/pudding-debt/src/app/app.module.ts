import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localeNo from '@angular/common/locales/no';
import { LOCALE_ID, NgModule } from '@angular/core';
import {
	MAT_SNACK_BAR_DEFAULT_OPTIONS,
	MatSnackBarModule,
} from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './features/footer/footer.component';
import { AuthInterceptor } from './services/auth/auth.interceptor';
import { ErrorMessageComponent } from './services/message/error/error-message.component';
import { SuccessMessageComponent } from './services/message/success/success-message.component';

registerLocaleData(localeNo);

@NgModule({
	declarations: [
		AppComponent,
		SuccessMessageComponent,
		ErrorMessageComponent,
		FooterComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
		BrowserAnimationsModule,
		HttpClientModule,
		MatSnackBarModule,
	],
	providers: [
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
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
