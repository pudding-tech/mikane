import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from 'src/app/shared/shared.module';
import { EventDialogComponent } from './event-dialog/event-dialog.component';
import { EventComponent } from './event/event.component';
import { EventsRoutingModule } from './events-routing.module';
import { EventsComponent } from './events.component';

@NgModule({
	declarations: [EventsComponent, EventComponent, EventDialogComponent],
	imports: [
		EventsRoutingModule,
		SharedModule,
		FormsModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatInputModule,
		MatButtonModule,
		MatTabsModule,
		MatToolbarModule,
		MatIconModule,
		MatListModule,
		MatCardModule,
	],
})
export class EventsModule {}
