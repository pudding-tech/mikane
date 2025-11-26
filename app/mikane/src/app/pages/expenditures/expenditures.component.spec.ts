import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpendituresComponent } from './expenditures.component';

describe('ExpendituresComponent', () => {
	let component: ExpendituresComponent;
	let fixture: ComponentFixture<ExpendituresComponent>;
	let activatedRouteStub: Partial<ActivatedRoute>;
	let messageServiceStub: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		activatedRouteStub = {};
		messageServiceStub = { showError: vi.fn(), showSuccess: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [MatBottomSheetModule, MatDialogModule, MatIconModule, ExpendituresComponent, ProgressSpinnerComponent],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceStub },
				{ provide: ENV, useValue: {} as Environment },
				{ provide: LogService, useValue: { error: vi.fn() } },
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
