import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserComponent } from './pages/user/user.component';
import { ExpendituresComponent } from './pages/expenditures/expenditures.component';
import { PaymentStructureComponent } from './pages/payment-structure/payment-structure.component';
import { EventsComponent } from './pages/events/events.component';
import { HttpClientModule } from '@angular/common/http';
import { CategoryComponent } from './pages/category/category.component';
import { EventComponent } from './pages/events/event/event.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { CategoryDialogComponent } from './pages/category/category-dialog/category-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { registerLocaleData } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
	MatSnackBarModule,
	MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';

import localeNo from '@angular/common/locales/no';
import { ExpenditureDialogComponent } from './pages/expenditures/expenditure-dialog/expenditure-dialog.component';
import { UserDialogComponent } from './pages/user/user-dialog/user-dialog.component';
import { EventDialogComponent } from './pages/events/event-dialog/event-dialog.component';
import { SuccessMessageComponent } from './services/message/success/success-message.component';
import { ErrorMessageComponent } from './services/message/error/error-message.component';
import { SharedModule } from './shared/shared.module';
import { CategoryEditDialogComponent } from './pages/category/category-edit-dialog/category-edit-dialog.component';
import { DeleteUserDialogComponent } from './pages/user/delete-user-dialog/delete-user-dialog.component';
import { DeleteCategoryDialogComponent } from './pages/category/category-delete-dialog/category-delete-dialog.component';
registerLocaleData(localeNo);

@NgModule({
	declarations: [
		AppComponent,
		UserComponent,
		ExpendituresComponent,
		PaymentStructureComponent,
		EventsComponent,
		CategoryComponent,
		EventComponent,
		CategoryDialogComponent,
		ExpenditureDialogComponent,
		UserDialogComponent,
		EventDialogComponent,
		SuccessMessageComponent,
		ErrorMessageComponent,
		CategoryEditDialogComponent,
        DeleteUserDialogComponent,
        DeleteCategoryDialogComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		SharedModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
		BrowserAnimationsModule,
		HttpClientModule,
		ReactiveFormsModule,
		FormsModule,
		DragDropModule,
		MatButtonModule,
		MatTabsModule,
		MatIconModule,
		MatListModule,
		MatCardModule,
		MatDividerModule,
		MatTableModule,
		MatExpansionModule,
		MatToolbarModule,
		MatInputModule,
		MatSelectModule,
		MatDialogModule,
		MatAutocompleteModule,
		MatProgressSpinnerModule,
		MatSnackBarModule,
        MatCheckboxModule,
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
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
