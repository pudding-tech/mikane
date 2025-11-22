import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuestDialogComponent } from './guest-dialog/guest-dialog.component';
import { GuestsComponent } from './guests.component';

describe('GuestsComponent', () => {
	let userServiceSpy: {
		loadGuestUsers: ReturnType<typeof vi.fn>;
		createGuestUser: ReturnType<typeof vi.fn>;
		editGuestUser: ReturnType<typeof vi.fn>;
		deleteGuestUser: ReturnType<typeof vi.fn>;
	};
	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let dialogSpy: { open: ReturnType<typeof vi.fn> };
	let activatedRouteStub: Partial<ActivatedRoute>;

	const mockGuests = [
		{ id: 'g1', name: 'Guest One', avatarURL: 'avatar1', guestCreatedBy: 'u1' } as User,
		{ id: 'g2', name: 'Guest Two', avatarURL: 'avatar2', guestCreatedBy: 'u2' } as User,
	];
	const mockCurrentUser = { id: 'u1', name: 'Admin', superAdmin: true, avatarURL: 'avatar3' } as User;

	beforeEach(() => {
		userServiceSpy = {
			loadGuestUsers: vi.fn(),
			createGuestUser: vi.fn(),
			editGuestUser: vi.fn(),
			deleteGuestUser: vi.fn(),
		};
		authServiceSpy = { getCurrentUser: vi.fn() };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
		dialogSpy = { open: vi.fn(() => ({ afterClosed: () => of(false) })) };
		activatedRouteStub = {};

		userServiceSpy.loadGuestUsers.mockReturnValue(of(mockGuests));
		authServiceSpy.getCurrentUser.mockReturnValue(of(mockCurrentUser));

		TestBed.configureTestingModule({
			imports: [GuestsComponent],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: MatDialog, useValue: dialogSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: BreakpointService, useValue: { isMobile: vi.fn(() => of(false)) } },
				{ provide: ActivatedRoute, useValue: activatedRouteStub },
			],
		})
			.overrideComponent(GuestsComponent, {
				remove: {
					imports: [MatDialogModule],
				},
			})
			.compileComponents();
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(GuestsComponent);
		const component = fixture.componentInstance;

		expect(component).toBeTruthy();
	});

	it('should load guests and current user on init', () => {
		const fixture = TestBed.createComponent(GuestsComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();

		expect(userServiceSpy.loadGuestUsers).toHaveBeenCalledWith();
		expect(authServiceSpy.getCurrentUser).toHaveBeenCalledWith();
		expect(component.guests).toEqual(mockGuests);
		expect(component.currentUser).toEqual(mockCurrentUser);
		expect(component.loading).toBe(false);
	});

	it('should show error if loading guests fails', () => {
		userServiceSpy.loadGuestUsers.mockReturnValue(throwError(() => new Error('error')));
		const fixture = TestBed.createComponent(GuestsComponent);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to load guest users');
	});

	it('should open dialog for new guest', () => {
		const fixture = TestBed.createComponent(GuestsComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		component.newGuest();

		expect(dialogSpy.open).toHaveBeenCalledWith(GuestDialogComponent, {
			width: '350px',
		});
	});

	it('should open dialog for editing guest', () => {
		const fixture = TestBed.createComponent(GuestsComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		component.editGuest(mockGuests[0]);

		expect(dialogSpy.open).toHaveBeenCalledWith(GuestDialogComponent, {
			width: '400px',
			data: { edit: true, guest: mockGuests[0] },
			autoFocus: false,
		});
	});

	it('should update pagedGuests on page change', () => {
		const fixture = TestBed.createComponent(GuestsComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();
		component.onPageChange({ pageIndex: 1, pageSize: 1, length: 2 });

		expect(component.pagedGuests.length).toBe(1);
	});
});
