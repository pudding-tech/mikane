import { AsyncPipe } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventInfoComponent } from './event-info.component';

describe('EventInfoComponent', () => {
	let component: EventInfoComponent;
	let fixture: ComponentFixture<EventInfoComponent>;
	let loadUsersByEventSpy: ReturnType<typeof vi.fn>;
	let getCurrentUserSpy: ReturnType<typeof vi.fn>;
	let showErrorSpy: ReturnType<typeof vi.fn>;

	function createComponent(
		event$ = of({
			id: 'test',
			name: 'test',
			description: 'test',
			adminIds: [],
			status: { id: 1, name: 'Active' },
		} as PuddingEvent),
	) {
		fixture = TestBed.createComponent(EventInfoComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('$event', event$);
		fixture.detectChanges();
	}

	describe('', () => {
		beforeEach(() => {
			loadUsersByEventSpy = vi.fn().mockReturnValue(
				of([
					{ id: 'test', name: 'test', eventInfo: { isAdmin: true }, avatarURL: 'test-avatar.png' },
					{ id: 'test2', name: 'test2', eventInfo: { isAdmin: false }, avatarURL: 'test2-avatar.png' },
				] as User[]),
			);
			getCurrentUserSpy = vi.fn().mockReturnValue(of({ id: 'test' } as User));
			showErrorSpy = vi.fn();

			TestBed.configureTestingModule({
				imports: [EventInfoComponent, AsyncPipe],
				providers: [
					{ provide: UserService, useValue: { loadUsersByEvent: loadUsersByEventSpy } },
					{ provide: AuthService, useValue: { getCurrentUser: getCurrentUserSpy } },
					{ provide: MessageService, useValue: { showError: showErrorSpy } },
					{ provide: LogService, useValue: { error: vi.fn() } },
					provideZonelessChangeDetection(),
				],
			}).compileComponents();

			return createComponent();
		});

		it('should create', () => {
			expect(component).toBeTruthy();
		});

		it('should get event', () => {
			expect(component.event).toEqual({
				id: 'test',
				name: 'test',
				description: 'test',
				adminIds: [],
				status: { id: 1, name: 'Active' },
			} as PuddingEvent);
		});

		it('should get current user', () => {
			expect(component.currentUser).toEqual({ id: 'test' } as User);
		});

		it('should filter users by admin', () => {
			expect(component.adminsInEvent).toEqual([
				{ id: 'test', name: 'test', eventInfo: { isAdmin: true }, avatarURL: 'test-avatar.png' },
			] as User[]);
		});
	});

	describe('from user service', () => {
		beforeEach(() => {
			loadUsersByEventSpy = vi.fn().mockReturnValue(throwError(() => 'test error'));
			getCurrentUserSpy = vi.fn().mockReturnValue(of({ id: 'test' } as User));
			showErrorSpy = vi.fn();

			TestBed.configureTestingModule({
				imports: [EventInfoComponent, AsyncPipe],
				providers: [
					{ provide: UserService, useValue: { loadUsersByEvent: loadUsersByEventSpy } },
					{ provide: AuthService, useValue: { getCurrentUser: getCurrentUserSpy } },
					{ provide: MessageService, useValue: { showError: showErrorSpy } },
					{ provide: LogService, useValue: { error: vi.fn() } },
				],
			}).compileComponents();

			return createComponent();
		});

		it('should show user error message', () => {
			expect(showErrorSpy).toHaveBeenCalledWith('Error loading event settings');
		});
	});

	describe('from auth service', () => {
		beforeEach(() => {
			loadUsersByEventSpy = vi.fn().mockReturnValue(
				of([
					{ id: 'test', name: 'test', eventInfo: { isAdmin: true }, avatarURL: 'test-avatar.png' },
					{ id: 'test2', name: 'test2', eventInfo: { isAdmin: false }, avatarURL: 'test2-avatar.png' },
				] as User[]),
			);
			getCurrentUserSpy = vi.fn().mockReturnValue(throwError(() => 'test error'));
			showErrorSpy = vi.fn();

			TestBed.configureTestingModule({
				imports: [EventInfoComponent, AsyncPipe],
				providers: [
					{ provide: UserService, useValue: { loadUsersByEvent: loadUsersByEventSpy } },
					{ provide: AuthService, useValue: { getCurrentUser: getCurrentUserSpy } },
					{ provide: MessageService, useValue: { showError: showErrorSpy } },
					{ provide: LogService, useValue: { error: vi.fn() } },
				],
			}).compileComponents();

			return createComponent();
		});

		it('should show auth error message', () => {
			expect(showErrorSpy).toHaveBeenCalledWith('Error loading event settings');
		});
	});
});
