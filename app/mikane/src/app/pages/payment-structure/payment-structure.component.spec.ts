import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { MockModule } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';

import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { PaymentStructureComponent } from './payment-structure.component';

describe('PaymentStructureComponent', () => {
	let component: PaymentStructureComponent;
	let fixture: ComponentFixture<PaymentStructureComponent>;
	let activatedRouteStub: ActivatedRoute;
	let messageServiceStub: MessageService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule, MockModule(MatCardModule), PaymentStructureComponent],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
				{ provide: ENV, useValue: {} as Environment },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PaymentStructureComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
