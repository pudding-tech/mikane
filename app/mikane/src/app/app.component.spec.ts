import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockService } from 'ng-mocks';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { AppComponent } from './app.component';
import { FooterComponent } from './features/footer/footer.component';
import { LogService } from './services/log/log.service';

describe('AppComponent', () => {
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			providers: [
				{
					provide: LogService,
					useValue: MockService(LogService),
				},
				{ provide: ENV, useValue: {} as Environment },
			],
			imports: [RouterTestingModule, FooterComponent, AppComponent],
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
});
