import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { of, throwError } from 'rxjs';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PreferencesComponent } from './preferences.component';

describe('PreferencesComponent', () => {
	let component: PreferencesComponent;
	let fixture: ComponentFixture<PreferencesComponent>;
	let userServiceSpy: { editUserPreferences: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn> };

	beforeEach(async () => {
		userServiceSpy = { editUserPreferences: vi.fn() };
		messageServiceSpy = { showError: vi.fn() };
		TestBed.configureTestingModule({
			imports: [
				CommonModule,
				PreferencesComponent,
				MatCardModule,
				MatIconModule,
				MatFormFieldModule,
				FormsModule,
				ReactiveFormsModule,
				MatSlideToggleModule,
			],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PreferencesComponent);
		component = fixture.componentInstance;
		component.user.set({
			id: '1',
			publicEmail: false,
			publicPhone: true,
		} as User);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize publicEmail and publicPhone from user', () => {
		expect(component.user().publicEmail).toEqual(false);
		expect(component.user().publicPhone).toEqual(true);
	});

	it('should toggle email setting', async () => {
		userServiceSpy.editUserPreferences.mockReturnValue(of(component.user()));
		const emailToggleButton = fixture.nativeElement.querySelector('#emailToggle-button');

		expect(emailToggleButton).toBeTruthy();

		emailToggleButton.click();
		fixture.detectChanges();

		expect(userServiceSpy.editUserPreferences).toHaveBeenCalledWith('1', true, undefined);
	});

	it('should toggle phone setting', async () => {
		userServiceSpy.editUserPreferences.mockReturnValue(of(component.user));
		const phoneToggleButton = fixture.nativeElement.querySelector('#phoneToggle-button');

		expect(phoneToggleButton).toBeTruthy();

		phoneToggleButton.click();
		fixture.detectChanges();

		expect(userServiceSpy.editUserPreferences).toHaveBeenCalledWith('1', undefined, false);
	});

	it('should handle error', async () => {
		userServiceSpy.editUserPreferences.mockReturnValue(throwError(() => new Error('Error')));
		const emailToggleButton = fixture.nativeElement.querySelector('#emailToggle-button');

		emailToggleButton.click();
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change user preferences');

		messageServiceSpy.showError.mockClear();
		const phoneToggleButton = fixture.nativeElement.querySelector('#phoneToggle-button');

		phoneToggleButton.click();
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change user preferences');
	});
});
