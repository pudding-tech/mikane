import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountComponent } from './account.component';

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'user-settings', template: '', standalone: true })
class MockUserSettingsComponent {}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'change-password', template: '', standalone: true })
class MockChangePasswordComponent {}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'danger-zone', template: '', standalone: true })
class MockDangerZoneComponent {}

@Component({ selector: 'app-menu', template: '', standalone: true })
class MockMenuComponent {}

@Component({ selector: 'app-loading-spinner', template: '', standalone: true })
class MockProgressSpinnerComponent {}

describe('AccountComponent', () => {
	let component: AccountComponent;
	let fixture: ComponentFixture<AccountComponent>;
	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
	let userServiceSpy: { loadUserById: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn> };
	let page: AccountComponentPage;
	let httpTestingController: HttpTestingController;

	beforeEach(async () => {
		const env = { apiUrl: 'http://localhost:3002/api/' } as Environment;
		authServiceSpy = { getCurrentUser: vi.fn() };
		userServiceSpy = { loadUserById: vi.fn() };
		messageServiceSpy = { showError: vi.fn() };

		await TestBed.configureTestingModule({
			imports: [
				AccountComponent,
				CommonModule,
				MatToolbarModule,
				MatButtonModule,
				MatDialogModule,
				MatIconModule,
				MatCardModule,
				RouterTestingModule,
				MockUserSettingsComponent,
				MockChangePasswordComponent,
				MockDangerZoneComponent,
				MockMenuComponent,
				MockProgressSpinnerComponent,
			],
			providers: [
				{ provide: BreakpointService, useValue: { isMobile: () => of(false) } },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: ENV, useValue: env },
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(AccountComponent);
		component = fixture.componentInstance;
		page = new AccountComponentPage(fixture);
		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		fixture.destroy();
		httpTestingController.verify();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should load the user and set loading to false', async () => {
			const user: User = { id: '1', name: 'John Doe' } as User;
			authServiceSpy.getCurrentUser.mockReturnValue(of(user));
			userServiceSpy.loadUserById.mockReturnValue(of(user));

			component.ngOnInit();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(authServiceSpy.getCurrentUser).toHaveBeenCalledWith();
			expect(userServiceSpy.loadUserById).toHaveBeenCalledWith(user.id);
			expect(page.loading).toBeFalsy();
			expect(page.user).toBeDefined();
			expect(page.password).toBeDefined();
			expect(page.dangerZone).toBeDefined();
		});

		it('should handle errors while loading the user', async () => {
			const user: User = { id: '1', name: 'John Doe' } as User;
			authServiceSpy.getCurrentUser.mockReturnValue(of(user));
			userServiceSpy.loadUserById.mockReturnValue(throwError(() => new Error('Error')));
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			messageServiceSpy.showError.mockImplementation(() => {});

			component.ngOnInit();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(authServiceSpy.getCurrentUser).toHaveBeenCalledWith();
			expect(userServiceSpy.loadUserById).toHaveBeenCalledWith(user.id);
			expect(page.loading).toBeFalsy();
			expect(page.user).toBeFalsy();
			expect(page.password).toBeFalsy();
			expect(page.dangerZone).toBeFalsy();
			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Something went wrong');
		});

		it('should handle errors while getting the current user', async () => {
			authServiceSpy.getCurrentUser.mockReturnValue(throwError(() => new Error('Error')));

			component.ngOnInit();
			await fixture.whenStable();
			fixture.detectChanges();

			expect(authServiceSpy.getCurrentUser).toHaveBeenCalledWith();
			expect(userServiceSpy.loadUserById).not.toHaveBeenCalled();
			expect(page.loading).toBeFalsy();
			expect(page.user).toBeFalsy();
			expect(page.password).toBeFalsy();
			expect(page.dangerZone).toBeFalsy();
			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Something went wrong');
		});
	});
});

export class AccountComponentPage {
	constructor(private fixture: ComponentFixture<AccountComponent>) {}

	get loading(): DebugElement {
		return this.fixture.debugElement.query(By.css('app-loading-spinner'));
	}

	get user(): DebugElement {
		return this.fixture.debugElement.query(By.css('user-settings'));
	}

	get password(): DebugElement {
		return this.fixture.debugElement.query(By.css('change-password'));
	}

	get dangerZone(): DebugElement {
		return this.fixture.debugElement.query(By.css('danger-zone'));
	}
}
