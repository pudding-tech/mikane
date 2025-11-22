import { registerLocaleData } from '@angular/common';
import localeNo from '@angular/common/locales/no';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { Expense } from 'src/app/services/expense/expense.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileComponent } from './profile.component';

class PC extends ProfileComponent {
	public override user: User;
	public override events: PuddingEvent[];
	public override expenses: Expense[];
}

describe('ProfileComponent', () => {
	registerLocaleData(localeNo);
	let userServiceSpy: {
		loadUserByUsernameOrId: ReturnType<typeof vi.fn>;
		loadUserById: ReturnType<typeof vi.fn>;
		loadUserEvents: ReturnType<typeof vi.fn>;
		loadUserExpenses: ReturnType<typeof vi.fn>;
	};
	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let routerSpy: {
		navigate: ReturnType<typeof vi.fn>;
		createUrlTree: ReturnType<typeof vi.fn>;
		serializeUrl: ReturnType<typeof vi.fn>;
		events: Subject<Event>;
	};
	let activatedRouteSpy: { paramMap: Observable<{ get: (key: string) => string | null }> };
	let titleSpy: { setTitle: ReturnType<typeof vi.fn> };

	const mockUser = {
		id: 'u1',
		name: 'Test User',
		firstName: 'Test',
		lastName: 'User',
		username: 'testuser',
		email: 'test@example.com',
		publicEmail: true,
		phone: '12345678',
		publicPhone: true,
		avatarURL: '',
	};
	const mockEvents = [
		{
			id: 'e1',
			name: 'Event 1',
			description: '',
			adminIds: ['u1'],
			userInfo: { inEvent: true, id: 'u1' },
			status: { id: 1 },
			private: false,
		},
	];
	const mockExpenses = [
		{
			id: 'ex1',
			name: 'Expense 1',
			amount: 100,
			categoryInfo: { icon: 'shopping_cart' },
			eventInfo: { id: 'e1', name: 'Event 1' },
			payer: { id: 'u1' },
			created: new Date(),
		},
	];

	beforeEach(() => {
		userServiceSpy = {
			loadUserByUsernameOrId: vi.fn(),
			loadUserById: vi.fn(),
			loadUserEvents: vi.fn(),
			loadUserExpenses: vi.fn(),
		};
		authServiceSpy = { getCurrentUser: vi.fn() };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
		routerSpy = {
			navigate: vi.fn(),
			createUrlTree: vi.fn(),
			serializeUrl: vi.fn(),
			events: new Subject(),
		};
		activatedRouteSpy = { paramMap: of({ get: (key: string) => (key === 'usernameOrId' ? 'testuser' : null) }) };
		titleSpy = { setTitle: vi.fn() };

		userServiceSpy.loadUserByUsernameOrId.mockReturnValue(of(mockUser));
		userServiceSpy.loadUserById.mockReturnValue(of(mockUser));
		userServiceSpy.loadUserEvents.mockReturnValue(of(mockEvents));
		userServiceSpy.loadUserExpenses.mockReturnValue(of(mockExpenses));
		authServiceSpy.getCurrentUser.mockReturnValue(of(mockUser));

		TestBed.configureTestingModule({
			imports: [ProfileComponent],
			providers: [
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: BreakpointService, useValue: { isMobile: vi.fn(() => of(false)) } },
				{ provide: Router, useValue: routerSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteSpy },
				{ provide: Title, useValue: titleSpy },
			],
		}).compileComponents();
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(ProfileComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();

		expect(component).toBeTruthy();
	});

	it('should load user, events, and expenses on init', () => {
		const fixture = TestBed.createComponent(ProfileComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();

		expect(userServiceSpy.loadUserByUsernameOrId).toHaveBeenCalledWith('testuser');
		expect(userServiceSpy.loadUserEvents).toHaveBeenCalledWith('u1', 5);
		expect(userServiceSpy.loadUserExpenses).toHaveBeenCalledWith('u1', null, 5);
		expect((component as PC).user).toEqual(mockUser);
		expect((component as PC).events).toEqual(mockEvents);
		expect((component as PC).expenses[0].name).toBe('Expense 1');
	});

	it('should show error if user not found', () => {
		userServiceSpy.loadUserByUsernameOrId.mockReturnValue(of(undefined));
		const fixture = TestBed.createComponent(ProfileComponent);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('User not found');
	});

	it('should show error if loading fails', () => {
		userServiceSpy.loadUserByUsernameOrId.mockReturnValue(throwError(() => new Error('error')));
		const fixture = TestBed.createComponent(ProfileComponent);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Something went wrong');
	});

	it('should navigate to event on gotoEvent', () => {
		const fixture = TestBed.createComponent(ProfileComponent);
		const component = fixture.componentInstance;
		(component as PC).user = mockUser as User;
		fixture.detectChanges();
		component.gotoEvent('e1');

		expect(routerSpy.navigate).toHaveBeenCalledWith(['events', 'e1', 'participants']);
	});

	it('should navigate to expenses on gotoExpenses (desktop)', () => {
		const fixture = TestBed.createComponent(ProfileComponent);
		const component = fixture.componentInstance;
		(component as PC).user = mockUser as User;
		fixture.detectChanges();
		component.gotoExpenses(mockExpenses[0] as Expense);

		expect(routerSpy.navigate).toHaveBeenCalledWith(['events', 'e1', 'expenses'], { queryParams: { payers: 'u1' } });
	});
});
