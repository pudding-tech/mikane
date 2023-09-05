import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MockComponent, MockDirective, MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { SplitButtonItemComponent } from '../../features/split-button/split-button-item/split-button-item.component';
import { SplitButtonItemDirective } from '../../features/split-button/split-button-item/split-button-item.directive';
import { SplitButtonComponent } from '../../features/split-button/split-button.component';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
	let component: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;
	let routerSpy: jasmine.SpyObj<Router>;
	let authServiceSpy: jasmine.SpyObj<AuthService>;
	let messageServiceSpy: jasmine.SpyObj<MessageService>;

	beforeEach(() => {
		routerSpy = jasmine.createSpyObj('Router', ['navigate']);
		authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
		messageServiceSpy = jasmine.createSpyObj('MessageService', ['showError']);

		TestBed.configureTestingModule({
			declarations: [
				MockComponent(SplitButtonComponent),
				MockComponent(SplitButtonItemComponent),
				MockDirective(SplitButtonItemDirective),
			],
			imports: [MenuComponent, CommonModule, MockModule(MatIconModule)],
			providers: [
				BreakpointService,
				{ provide: Router, useValue: routerSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should get the current user on init', () => {
		const user: User = { id: '1', name: 'Test User' } as User;
		authServiceSpy.getCurrentUser.and.returnValue(of(user));
		component.ngOnInit();
		expect(component.user).toEqual(user);
	});

	it('should show an error message if failed to get user on init', () => {
		const error: ApiError = { error: { message: 'Test Error' } } as ApiError;
		authServiceSpy.getCurrentUser.and.returnValue(throwError(() => error));
		component.ngOnInit();
		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to get user');
	});

	it('should navigate to account page when onAccountClick is called', () => {
		component.onAccountClick();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/account']);
	});

	it('should not navigate to account page when onAccountClick is called and already on account page', () => {
		// @ts-ignore
		routerSpy.url = '/account';
		component.onAccountClick();
		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	it('should navigate to profile page when onProfileClick is called', () => {
		const user: User = { id: '1', name: 'Test User' } as User;
		component.user = user;
		component.onProfileClick();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/u', user.id]);
	});

	it('should not navigate to profile page when onProfileClick is called and already on profile page', () => {
		const user: User = { id: '1', name: 'Test User' } as User;
		component.user = user;
		// @ts-ignore
		routerSpy.url = `/u/${user.id}`;
		component.onProfileClick();
		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	it('should log out and navigate to login page when logout is called', () => {
		authServiceSpy.logout.and.returnValue(of(null));
		component.logout();
		expect(authServiceSpy.logout).toHaveBeenCalled();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
	});

	it('should show an error message if failed to log out', () => {
		const error: ApiError = { error: { message: 'Test Error' } } as ApiError;
		authServiceSpy.logout.and.returnValue(throwError(() => error));
		component.logout();
		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to log out');
	});

	it('should navigate to guests page when onGuestsClick is called', () => {
		component.onGuestsClick();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/guests']);
	});

	it('should not navigate to guests page when onGuestsClick is called and already on guests page', () => {
		// @ts-ignore
		routerSpy.url = '/guests';
		component.onGuestsClick();
		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	it('should navigate to invite page when inviteUser is called', () => {
		component.inviteUser();
		expect(routerSpy.navigate).toHaveBeenCalledWith(['/invite']);
	});

	it('should not navigate to invite page when inviteUser is called and already on invite page', () => {
		// @ts-ignore
		routerSpy.url = '/invite';
		component.inviteUser();
		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});
});
