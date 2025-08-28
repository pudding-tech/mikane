import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageService } from 'src/app/services/message/message.service';
import { LogService } from 'src/app/services/log/log.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { EventsComponent } from './events.component';

describe('EventsComponent', () => {
	let component: EventsComponent;
	let fixture: ComponentFixture<EventsComponent>;
	let activatedRouteStub: Partial<ActivatedRoute>;
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>, showSuccess: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		activatedRouteStub = {};
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };

		TestBed.configureTestingModule({
			imports: [
				MatDialogModule,
				MatToolbarModule,
				MatIconModule,
				RouterModule,
				EventsComponent,
				ProgressSpinnerComponent,
			],
			providers: [
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: ENV, useValue: {} as Environment },
				{ provide: LogService, useValue: { error: vi.fn() } },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
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
