import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventComponent } from './event.component';

describe('EventComponent', () => {
	let fixture: ComponentFixture<EventComponent>;
	let component: EventComponent;

	let eventServiceSpy: { getEvent: ReturnType<typeof vi.fn> };
	let routerSpy: {
		navigate: ReturnType<typeof vi.fn>;
		currentNavigation: ReturnType<typeof vi.fn>;
		createUrlTree: ReturnType<typeof vi.fn>;
		serializeUrl: ReturnType<typeof vi.fn>;
		events: Subject<Event>;
	};
	let activatedRouteSpy: Partial<ActivatedRoute>;
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		eventServiceSpy = {
			getEvent: vi.fn(),
		};
		routerSpy = {
			navigate: vi.fn(),
			currentNavigation: vi.fn(),
			createUrlTree: vi.fn(() => ''),
			serializeUrl: vi.fn(() => ''),
			events: new Subject(),
		};
		activatedRouteSpy = {
			params: of({ eventId: '1' }),
		};
		messageServiceSpy = { showError: vi.fn() };

		TestBed.configureTestingModule({
			imports: [EventComponent],
			providers: [
				{ provide: EventService, useValue: eventServiceSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: ActivatedRoute, useValue: activatedRouteSpy },
				{ provide: AuthService, useValue: { getCurrentUser: vi.fn(), clearCurrentUser: vi.fn() } },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: BreakpointService, useValue: { isMobile: () => of(false) } },
				{ provide: ContextService, useValue: { isIosPwaStandalone: false } },
				provideZonelessChangeDetection(),
			],
		}).compileComponents();

		const event = {
			id: '1',
			name: 'Test Event',
			status: {
				id: EventStatusType.ACTIVE,
				name: 'Active',
			},
			userInfo: {
				isAdmin: true,
			},
		} as PuddingEvent;
		eventServiceSpy.getEvent.mockReturnValue(of(event));

		fixture = TestBed.createComponent(EventComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should load event on init', () => {
		expect(component.event).toEqual(
			expect.objectContaining({
				id: '1',
				name: 'Test Event',
				status: { id: EventStatusType.ACTIVE, name: 'Active' },
			}),
		);
	});

	it('should return true if user is admin', () => {
		expect(component.isEventAdmin()).toBe(true);
	});

	it('should navigate to /events if event not found', () => {
		eventServiceSpy.getEvent.mockReturnValue(of(undefined));
		const fixture = TestBed.createComponent(EventComponent);
		fixture.detectChanges();

		expect(routerSpy.navigate).toHaveBeenCalledWith(['/events']);
	});

	it('should show error if event loading fails', () => {
		eventServiceSpy.getEvent.mockReturnValue(throwError(() => new Error('error')));
		const fixture = TestBed.createComponent(EventComponent);
		fixture.detectChanges();

		expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading event');
	});
});
