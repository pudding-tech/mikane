import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MockModule } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';

import { ParticipantComponent } from './participant.component';

describe('ParticipantComponent', () => {
	let component: ParticipantComponent;
	let fixture: ComponentFixture<ParticipantComponent>;
	let activatedRouteStub: ActivatedRoute;
	let messageServiceStub: MessageService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				MockModule(MatDialogModule),
				MockModule(MatIconModule),
				MockModule(MatCardModule),
				ParticipantComponent,
			],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ParticipantComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
