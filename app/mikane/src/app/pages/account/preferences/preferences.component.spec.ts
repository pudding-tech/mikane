import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { MockModule, MockService } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { PreferencesComponent } from './preferences.component';

describe('PreferencesComponent', () => {
	let component: PreferencesComponent;
	let fixture: ComponentFixture<PreferencesComponent>;
	let loader: HarnessLoader;
	let userServiceSpy: jasmine.SpyObj<UserService>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;

	beforeEach(waitForAsync(() => {
		userServiceSpy = jasmine.createSpyObj('UserService', ['editUserPreferences']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showError']);
		TestBed.configureTestingModule({
			imports: [
				CommonModule,
				PreferencesComponent,
				MockModule(MatCardModule),
				MockModule(MatIconModule),
				MockModule(MatFormFieldModule),
				FormsModule,
				ReactiveFormsModule,
				MatSlideToggleModule,
			],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: MockService(LogService) },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(PreferencesComponent);
		component = fixture.componentInstance;
		loader = TestbedHarnessEnvironment.loader(fixture);
		component.user = {
			id: '1',
			publicEmail: false,
			publicPhone: true,
		} as User;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize publicEmail and publicPhone from user', () => {
		expect(component.user.publicEmail).toEqual(false);
		expect(component.user.publicPhone).toEqual(true);
	});

	it('should toggle email setting', async () => {
		userServiceSpy.editUserPreferences.and.returnValue(of(component.user));
		const toggles = await loader.getAllHarnesses(MatSlideToggleHarness);
		await toggles[0].toggle();
		fixture.detectChanges();

		expect(userServiceSpy.editUserPreferences).toHaveBeenCalledWith('1', true, undefined);
	});

	it('should toggle phone setting', async () => {
		userServiceSpy.editUserPreferences.and.returnValue(of(component.user));
		const toggles = await loader.getAllHarnesses(MatSlideToggleHarness);
		await toggles[1].toggle();
		fixture.detectChanges();

		expect(userServiceSpy.editUserPreferences).toHaveBeenCalledWith('1', undefined, false);
	});

	it('should handle error', async () => {
		userServiceSpy.editUserPreferences.and.returnValue(throwError(() => new Error('Error')));
		const toggles = await loader.getAllHarnesses(MatSlideToggleHarness);
		await toggles[0].toggle();
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change user preferences');

		messageServiceSpy.showError.calls.reset();

		await toggles[1].toggle();
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change user preferences');
	});
});
