import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MockComponent, MockModule, MockService } from 'ng-mocks';
import { MessageService } from 'src/app/services/message/message.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LogService } from 'src/app/services/log/log.service';
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
				MatBottomSheetModule,
				MockModule(MatDialogModule),
				MockModule(MatIconModule),
				ExpendituresComponent,
				MockComponent(ProgressSpinnerComponent),
			],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
				{ provide: ENV, useValue: {} as Environment },
				{ provide: LogService, useValue: MockService(LogService) },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
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
