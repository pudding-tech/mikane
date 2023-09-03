import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent, MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { AccountComponent } from './account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DangerZoneComponent } from './danger-zone/danger-zone.component';
import { UserSettingsComponent } from './user/user-settings.component';

describe('AccountComponent', () => {
	let component: AccountComponent;
	let fixture: ComponentFixture<AccountComponent>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let userServiceSpy: jasmine.SpyObj<UserService>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;
	let page: AccountComponentPage;

	beforeEach(async () => {
		authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
		userServiceSpy = jasmine.createSpyObj('UserService', ['loadUserById']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showError']);

		await TestBed.configureTestingModule({
			declarations: [
				MockComponent(UserSettingsComponent),
				MockComponent(ChangePasswordComponent),
				MockComponent(DangerZoneComponent),
				MockComponent(MenuComponent),
				MockComponent(ProgressSpinnerComponent),
			],

			imports: [
				AccountComponent,
				CommonModule,
				MockModule(MatToolbarModule),
				MockModule(MatButtonModule),
				MockModule(MatDialogModule),
				MockModule(MatIconModule),
				MockModule(MatCardModule),
				RouterTestingModule,
			],
			providers: [
				{
					provide: BreakpointService,
					useValue: {
						isMobile: () => of(false),
					},
				},
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AccountComponent);
		component = fixture.componentInstance;
		page = new AccountComponentPage(fixture);
	});

	afterEach(() => {
		fixture.destroy();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should load the user and set loading to false', () => {
			const user: User = { id: '1', name: 'John Doe' } as User;
			authServiceSpy.getCurrentUser.and.returnValue(of(user));
			userServiceSpy.loadUserById.and.returnValue(of(user));

			component.ngOnInit();

			expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
			expect(userServiceSpy.loadUserById).toHaveBeenCalledWith(user.id);
			expect(page.loading).toBeFalsy();
			expect(page.user).toBeDefined();
			expect(page.password).toBeDefined();
			expect(page.dangerZone).toBeDefined();
		});

		it('should handle errors while loading the user', fakeAsync(() => {
			const user: User = { id: '1', name: 'John Doe' } as User;
			authServiceSpy.getCurrentUser.and.returnValue(of(user));
			userServiceSpy.loadUserById.and.returnValue(throwError(() => new Error('Error')));
			messageServiceSpy.showError.and.stub();

			component.ngOnInit();
			tick();

			expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
			expect(userServiceSpy.loadUserById).toHaveBeenCalledWith(user.id);
			expect(page.loading).toBeFalsy();
			expect(page.user).toBeFalsy();
			expect(page.password).toBeFalsy();
			expect(page.dangerZone).toBeFalsy();
			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Something went wrong');
		}));

		it('should handle errors while getting the current user', () => {
			authServiceSpy.getCurrentUser.and.returnValue(throwError(() => new Error('Error')));

			component.ngOnInit();

			expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
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
	constructor(private fixture: ComponentFixture<any>) {}

	get loading(): DebugElement {
		return this.fixture.debugElement.query(By.css('loading-spinner'));
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
