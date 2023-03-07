import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockComponent, MockModule } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';

import { EventsComponent } from './events.component';

describe('EventComponent', () => {
	let component: EventsComponent;
	let fixture: ComponentFixture<EventsComponent>;
	let activatedRouteStub: ActivatedRoute;
	let messageServiceStub: MessageService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				MockModule(MatDialogModule),
				MockModule(MatToolbarModule),
				MockModule(MatIconModule),
				MockModule(RouterModule),
				EventsComponent,
				MockComponent(ProgressSpinnerComponent),
			],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(EventsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
