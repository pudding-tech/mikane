import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MockComponent, MockModule } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';

import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { ExpendituresComponent } from './expenditures.component';

describe('ExpendituresComponent', () => {
	let component: ExpendituresComponent;
	let fixture: ComponentFixture<ExpendituresComponent>;
	let activatedRouteStub: ActivatedRoute;
	let messageServiceStub: MessageService;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientTestingModule,
				MockModule(MatDialogModule),
				MockModule(MatIconModule),
				ExpendituresComponent,
				MockComponent(ProgressSpinnerComponent),
			],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
				{ provide: ENV, useValue: {} as Environment },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ExpendituresComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
