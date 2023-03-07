import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';
import { ExpenditureRoutingModule } from './expenditures-routing.module';
import { ExpendituresComponent } from './expenditures.component';

@NgModule({
	declarations: [ExpendituresComponent, ExpenditureDialogComponent],
	imports: [
		ExpenditureRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		MatInputModule,
		MatCardModule,
		MatIconModule,
		MatButtonModule,
		MatTableModule,
		MatDialogModule,
		MatFormFieldModule,
		MatAutocompleteModule,
		MatListModule,
	],
})
export class ExpendituresModule {}
