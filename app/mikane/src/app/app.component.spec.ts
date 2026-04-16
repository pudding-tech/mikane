import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppComponent } from './app.component';
import { FooterComponent } from './features/footer/footer.component';
import { LogService } from './services/log/log.service';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: MatIconRegistry,
					useValue: {
						addSvgIcon: vi.fn(),
					},
				},
				{
					provide: LogService,
					useValue: {
						info: vi.fn(),
					},
				},
				{
					provide: ENV,
					useValue: {
						version: '1.0.0',
					} as Environment,
				},
			],
			imports: [RouterModule, FooterComponent, AppComponent],
		}).compileComponents();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;

		expect(app).toBeTruthy();
	});

	it(`should have as title 'mikane'`, () => {
		const fixture = TestBed.createComponent(AppComponent);
		const app = fixture.componentInstance;

		expect(app).toBeTruthy();
	});

	it('should log info on app initialization', () => {
		const fixture = TestBed.createComponent(AppComponent);
		const logService = TestBed.inject(LogService);
		fixture.detectChanges();

		expect(logService.info).toHaveBeenCalledWith('Client version: 1.0.0');
	});
});
