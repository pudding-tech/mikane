import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MenuComponent } from '../../features/menu/menu.component';
import { AuthService } from '../../services/auth/auth.service';
import { BreakpointService } from '../../services/breakpoint/breakpoint.service';
import { LogService } from '../../services/log/log.service';
import { MessageService } from '../../services/message/message.service';
import { UserService } from '../../services/user/user.service';
import { InviteComponent } from './invite.component';

@Component({ selector: 'app-menu', template: '<div id="mock-app-menu"></div>', standalone: true })
class MockMenuComponent {
	toggled = false;
}

describe('InviteComponent', () => {
	let component: InviteComponent;
	let fixture: ComponentFixture<InviteComponent>;

	const authServiceSpy = { getCurrentUser: vi.fn(), logout: vi.fn() };
	const userServiceSpy = { loadGuestUsers: vi.fn(), inviteUser: vi.fn() };
	const messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
	const logServiceSpy = { error: vi.fn(), info: vi.fn() };
	const activatedRouteSpy = { snapshot: { params: {} }, params: of({}) };

	beforeEach(() => {
		userServiceSpy.loadGuestUsers.mockReturnValue(of([]));

		TestBed.configureTestingModule({
			imports: [InviteComponent, MockMenuComponent],
			providers: [
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: logServiceSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteSpy },
				{ provide: BreakpointService, useValue: { isMobile: () => false } },
			],
		})
			.overrideComponent(InviteComponent, {
				remove: {
					imports: [MenuComponent],
				},
				add: {
					imports: [MockMenuComponent],
				},
			})
			.compileComponents();

		fixture = TestBed.createComponent(InviteComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		vi.clearAllMocks();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should use the mock menu', () => {
		fixture.detectChanges();
		const mock = fixture.nativeElement.querySelector('#mock-app-menu');

		expect(mock).toBeTruthy();
	});

	it('should load guest users on init', () => {
		const guests = [{ id: '1', name: 'Guest' }];
		userServiceSpy.loadGuestUsers.mockReturnValue(of(guests));
		component.ngOnInit();

		expect(component.guests()).toEqual(guests);
	});

	it('should show error if loading guests fails', () => {
		userServiceSpy.loadGuestUsers.mockReturnValue(throwError(() => ({ error: { message: 'fail' } })));
		component.ngOnInit();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to load guest users');
		expect(logServiceSpy.error).toHaveBeenCalledWith('Something went wrong while loading guest users: [object Object]');
	});

	it('should show success when inviteUser succeeds', () => {
		userServiceSpy.inviteUser.mockReturnValue(of({}));
		component['inviteForm'].get('email').setValue('test@example.com');
		const formDirective = { resetForm: vi.fn() } as unknown as FormGroupDirective;
		component.inviteUser(formDirective);

		expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('User invite sent');
	});

	it('should show error when inviteUser fails', () => {
		userServiceSpy.inviteUser.mockReturnValue(throwError(() => ({ error: { code: 'PUD-103' } })));
		component['inviteForm'].get('email').setValue('test@example.com');
		const formDirective = { resetForm: vi.fn() } as unknown as FormGroupDirective;
		component.inviteUser(formDirective);

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('A user with this email already exists');
	});
});
