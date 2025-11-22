import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { UserService } from 'src/app/services/user/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteAccountComponent } from './delete-account.component';

describe('DeleteAccountComponent', () => {
	let component: DeleteAccountComponent;
	let fixture: ComponentFixture<DeleteAccountComponent>;
	let router: Router;

	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn>; clearCurrentUser: ReturnType<typeof vi.fn> };
	let userServiceSpy: { deleteUser: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };
	let activatedRouteSpy: { data: Observable<{ key: string }> };

	beforeEach(() => {
		authServiceSpy = {
			getCurrentUser: vi.fn(),
			clearCurrentUser: vi.fn(),
		};
		userServiceSpy = {
			deleteUser: vi.fn(),
		};
		messageServiceSpy = {
			showSuccess: vi.fn(),
			showError: vi.fn(),
		};
		activatedRouteSpy = {
			data: of({ key: 'test-key' }),
		};

		TestBed.configureTestingModule({
			imports: [DeleteAccountComponent, RouterTestingModule],
			providers: [
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: BreakpointService, useValue: { isMobile: () => false } },
				{ provide: ActivatedRoute, useValue: activatedRouteSpy },
				provideZonelessChangeDetection(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(DeleteAccountComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		router = TestBed.inject(Router);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should delete account successfully', () => {
		authServiceSpy.getCurrentUser.mockReturnValue(of({ id: 'user-id' }));
		userServiceSpy.deleteUser.mockReturnValue(of(null));
		const routerSpy = vi.spyOn(router, 'navigate');
		component.deleteAccount();

		expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Account deleted successfully!');
		expect(authServiceSpy.clearCurrentUser).toHaveBeenCalledWith();
		expect(routerSpy).toHaveBeenCalledWith(['/login']);
	});

	it('should show error if delete fails', () => {
		authServiceSpy.getCurrentUser.mockReturnValue(of({ id: 'user-id' }));
		userServiceSpy.deleteUser.mockReturnValue(throwError(() => 'error'));

		component.deleteAccount();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to delete account!');
	});
});
