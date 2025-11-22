import { registerLocaleData } from '@angular/common';
import localeNo from '@angular/common/locales/no';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { CategoryService } from 'src/app/services/category/category.service';
import { EventService } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExpenseComponent } from './expense.component';

describe('ExpenseComponent', () => {
	let eventServiceSpy: { getEvent: ReturnType<typeof vi.fn> };
	let expenseServiceSpy: {
		getExpense: ReturnType<typeof vi.fn>;
		editExpense: ReturnType<typeof vi.fn>;
		deleteExpense: ReturnType<typeof vi.fn>;
	};
	let categoryServiceSpy: { findOrCreate: ReturnType<typeof vi.fn> };
	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let routerSpy: {
		navigate: ReturnType<typeof vi.fn>;
		createUrlTree: ReturnType<typeof vi.fn>;
		serializeUrl: ReturnType<typeof vi.fn>;
		getCurrentNavigation: ReturnType<typeof vi.fn>;
	};
	let routeSpy: {
		snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } };
		parent: { parent: { snapshot: { paramMap: { get: ReturnType<typeof vi.fn> } } } };
	};

	registerLocaleData(localeNo);
	const eventMock = { id: 'event1', status: { id: 1, name: 'Active' }, userInfo: { isAdmin: true } };
	const expenseMock = {
		id: 'expense1',
		name: 'Dinner',
		amount: 100,
		categoryInfo: { id: '1', name: 'Food', icon: 'restaurant' },
		payer: { id: 'user1', name: 'Alice', avatarURL: 'avatar.png', guest: false, username: 'alice', authenticated: true },
		created: new Date(),
		description: 'Team dinner',
	} as Expense;

	beforeEach(() => {
		eventServiceSpy = { getEvent: vi.fn() };
		expenseServiceSpy = { getExpense: vi.fn(), editExpense: vi.fn(), deleteExpense: vi.fn() };
		categoryServiceSpy = { findOrCreate: vi.fn() };
		authServiceSpy = { getCurrentUser: vi.fn() };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };
		routerSpy = {
			navigate: vi.fn(),
			createUrlTree: vi.fn(() => ''),
			serializeUrl: vi.fn(() => ''),
			getCurrentNavigation: vi.fn(),
		};
		routeSpy = {
			snapshot: {
				paramMap: {
					get: vi.fn((key) => (key === 'id' ? 'expense1' : undefined)),
				},
			},
			parent: {
				parent: {
					snapshot: {
						paramMap: {
							get: vi.fn((key) => (key === 'eventId' ? 'event1' : undefined)),
						},
					},
				},
			},
		};

		eventServiceSpy.getEvent.mockReturnValue(of(eventMock));
		expenseServiceSpy.getExpense.mockReturnValue(of(expenseMock));
		authServiceSpy.getCurrentUser.mockReturnValue(of({ id: 'user1' }));

		TestBed.configureTestingModule({
			imports: [ExpenseComponent],
			providers: [
				{ provide: EventService, useValue: eventServiceSpy },
				{ provide: ExpenseService, useValue: expenseServiceSpy },
				{ provide: CategoryService, useValue: categoryServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: ActivatedRoute, useValue: routeSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: BreakpointService, useValue: { isMobile: vi.fn(() => of(false)) } },
				provideZonelessChangeDetection(),
			],
		}).compileComponents();
	});

	it('should create', () => {
		const fixture = TestBed.createComponent(ExpenseComponent);
		const component = fixture.componentInstance;

		expect(component).toBeTruthy();
	});

	it('should load event and expense on init', () => {
		const fixture = TestBed.createComponent(ExpenseComponent);
		const component = fixture.componentInstance;
		fixture.detectChanges();

		expect(eventServiceSpy.getEvent).toHaveBeenCalledWith('event1');
		expect(expenseServiceSpy.getExpense).toHaveBeenCalledWith('expense1');
		expect(component.event).toEqual(eventMock);
		expect(component.expense).toEqual(expenseMock);
	});

	it('should show error if expense fails to load', () => {
		expenseServiceSpy.getExpense.mockReturnValue(throwError(() => new Error('error')));
		const fixture = TestBed.createComponent(ExpenseComponent);
		const component = fixture.componentInstance;
		component.ngOnInit();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading expense');
		expect(component.expense).toBeUndefined();
	});

	it('should show error if user fails to load', () => {
		authServiceSpy.getCurrentUser.mockReturnValue(throwError(() => new Error('error')));
		const fixture = TestBed.createComponent(ExpenseComponent);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to get user');
	});
});
