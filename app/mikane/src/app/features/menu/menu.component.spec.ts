import { Component, Directive } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { SplitButtonComponent } from 'src/app/features/split-button/split-button.component';
import { SplitButtonItemComponent } from 'src/app/features/split-button/split-button-item/split-button-item.component';
import { SplitButtonItemDirective } from 'src/app/features/split-button/split-button-item/split-button-item.directive';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { MenuComponent } from './menu.component';

@Component({ selector: 'app-split-button', template: '<div id="mock-split-button"></div>', standalone: true })
class MockSplitButtonComponent {
	toggled = false;
}

@Component({ selector: 'app-split-button-item', template: '<div id="mock-split-button-item"></div>', standalone: true })
class MockSplitButtonItemComponent {}

@Directive({ selector: '[appSplitButtonItem]', standalone: true })
class MockSplitButtonItemDirective {}

describe('MenuComponent', () => {
	let component: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;

	const authServiceSpy = { getCurrentUser: vi.fn(),	logout: vi.fn() };
	const messageServiceSpy = {	showError: vi.fn() };
	const routerSpy = {	navigate: vi.fn(), get url() { return '/' }	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MenuComponent, MockSplitButtonComponent, MockSplitButtonItemComponent, MockSplitButtonItemDirective],
			providers: [
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: BreakpointService, useValue: { isMobile: () => false } },
				{ provide: LogService, useValue: { info: vi.fn(), error: vi.fn() } },
			],
		})
		.overrideComponent(MenuComponent, {
			remove: {
				imports: [
					SplitButtonComponent,
					SplitButtonItemComponent,
					SplitButtonItemDirective
				],
			},
			add: {
				imports: [
					MockSplitButtonComponent,
					MockSplitButtonItemComponent,
					MockSplitButtonItemDirective,
				],
			},
		})
		.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		vi.clearAllMocks();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should use the mock split button', () => {
		fixture.detectChanges();
		const mock = fixture.nativeElement.querySelector('#mock-split-button');

		expect(mock).toBeTruthy();
	});

	it('should get the current user on init', () => {
		const user: User = { id: '1', name: 'Test User' } as User;
		authServiceSpy.getCurrentUser.mockReturnValue(of(user));
		component.ngOnInit();

		expect(component.user).toEqual(user);
	});

	it('should show an error message if failed to get user on init', () => {
		const error: ApiError = { error: { message: 'Test Error' } } as ApiError;
		authServiceSpy.getCurrentUser.mockReturnValue(throwError(() => error));
		component.ngOnInit();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to get user');
	});

	it('should navigate to account page when onAccountClick is called', () => {
		component.onAccountClick();

		expect(routerSpy.navigate).toHaveBeenCalledWith(['/account']);
	});

	it('should not navigate to account page when onAccountClick is called and already on account page', () => {
		Object.defineProperty(routerSpy, 'url', { get: () => '/account' });
		component.onAccountClick();

		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	it('should navigate to profile page when onProfileClick is called', () => {
		const user: User = { id: '1', username: 'testuser', name: 'Test User' } as User;
		component.user = user;
		component.onProfileClick();

		expect(routerSpy.navigate).toHaveBeenCalledWith(['/u', user.username]);
	});

	it('should not navigate to profile page when onProfileClick is called and already on profile page', () => {
		const user: User = { id: '1', username: 'testuser', name: 'Test User' } as User;
		component.user = user;
		Object.defineProperty(routerSpy, 'url', { get: () => `/u/${user.username}` });
		component.onProfileClick();

		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	it('should log out and navigate to login page when logout is called', () => {
		authServiceSpy.logout.mockReturnValue(of(null));
		component.logout();

		expect(authServiceSpy.logout).toHaveBeenCalledWith();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('should show an error message if failed to log out', () => {
		const error: ApiError = { error: { message: 'Test Error' } } as ApiError;
		authServiceSpy.logout.mockReturnValue(throwError(() => error));
		component.logout();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to log out');
	});

	it('should navigate to guests page when onGuestsClick is called', () => {
		component.onGuestsClick();

		expect(routerSpy.navigate).toHaveBeenCalledWith(['/guests']);
	});

	it('should not navigate to guests page when onGuestsClick is called and already on guests page', () => {
		Object.defineProperty(routerSpy, 'url', { get: () => '/guests' });
		component.onGuestsClick();

		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	it('should navigate to invite page when inviteUser is called', () => {
		component.inviteUser();

		expect(routerSpy.navigate).toHaveBeenCalledWith(['/invite']);
	});

	it('should not navigate to invite page when inviteUser is called and already on invite page', () => {
		Object.defineProperty(routerSpy, 'url', { get: () => '/invite' });
		component.inviteUser();

		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});
});
