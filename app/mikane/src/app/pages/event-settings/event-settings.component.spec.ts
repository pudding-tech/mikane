import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventSettingsComponent } from './event-settings.component';

function createComponent(eventData?: Partial<PuddingEvent>) {
	const $event = new BehaviorSubject<PuddingEvent>({
		id: '1',
		name: 'test',
		description: 'test',
		status: {
			id: EventStatusType.ACTIVE,
			name: 'Active',
		},
		adminIds: [],
		...(eventData || {}),
	} as PuddingEvent);

	const fixture = TestBed.createComponent(EventSettingsComponent);
	const component = fixture.componentInstance;
	fixture.componentRef.setInput('$event', $event);
	fixture.detectChanges();
	return { fixture, component, $event };
}

describe('EventSettingsComponent', () => {
	let eventServiceSpy: {
		editEvent: ReturnType<typeof vi.fn>;
		deleteEvent: ReturnType<typeof vi.fn>;
		setUserAsAdmin: ReturnType<typeof vi.fn>;
		removeUserAsAdmin: ReturnType<typeof vi.fn>;
		sendReadyToSettleEmails: ReturnType<typeof vi.fn>;
		sendAddExpensesReminderEmails: ReturnType<typeof vi.fn>;
	};
	let userServiceSpy: { loadUsersByEvent: ReturnType<typeof vi.fn> };
	let authServiceSpy: { getCurrentUser: ReturnType<typeof vi.fn> };
	let contextServiceSpy: { isMobileDevice: () => boolean };
	let messageServiceSpy: { showError: ReturnType<typeof vi.fn>; showSuccess: ReturnType<typeof vi.fn> };
	let dialogSpy: { open: ReturnType<typeof vi.fn> };
	let routerSpy: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		eventServiceSpy = {
			editEvent: vi.fn().mockReturnValue(of({})),
			deleteEvent: vi.fn().mockReturnValue(of({})),
			setUserAsAdmin: vi.fn().mockReturnValue(of({})),
			removeUserAsAdmin: vi.fn().mockReturnValue(of({})),
			sendReadyToSettleEmails: vi.fn().mockReturnValue(of(null)),
			sendAddExpensesReminderEmails: vi.fn().mockReturnValue(of(null)),
		};
		userServiceSpy = { loadUsersByEvent: vi.fn().mockReturnValue(of([])) };
		authServiceSpy = { getCurrentUser: vi.fn().mockReturnValue(of({ id: '1' })) };
		contextServiceSpy = { isMobileDevice: () => false };
		messageServiceSpy = { showError: vi.fn(), showSuccess: vi.fn() };

		dialogSpy = { open: vi.fn() };
		routerSpy = {
			navigate: vi.fn(),
			navigateByUrl: vi.fn().mockResolvedValue(undefined),
		};

		TestBed.configureTestingModule({
			imports: [EventSettingsComponent],
			providers: [
				{ provide: EventService, useValue: eventServiceSpy },
				{ provide: UserService, useValue: userServiceSpy },
				{ provide: AuthService, useValue: authServiceSpy },
				{ provide: ContextService, useValue: contextServiceSpy },
				{ provide: MessageService, useValue: messageServiceSpy },
				{ provide: MatDialog, useValue: dialogSpy },
				{ provide: Router, useValue: routerSpy },
				{ provide: LogService, useValue: { error: vi.fn() } },
				{ provide: FormValidationService, useValue: {} },
			],
		})
			.overrideComponent(EventSettingsComponent, {
				remove: {
					imports: [MatDialogModule],
				},
			})
			.compileComponents();

		vi.clearAllMocks();
	});

	it('should create', () => {
		const { component } = createComponent();

		expect(component).toBeTruthy();
	});

	it('should set event data', () => {
		const { component } = createComponent();
		component.ngOnInit();

		expect(component.eventData.id).toEqual('1');
		expect(component.eventData.name).toEqual('test');
		expect(component.eventData.description).toEqual('test');
	});

	it('should set event admins and other users', () => {
		const users = [
			{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
			{ id: '2', eventInfo: { isAdmin: false }, avatarURL: 'url2' },
		] as User[];
		userServiceSpy.loadUsersByEvent.mockReturnValue(of(users));
		const { component } = createComponent();
		component.ngOnInit();

		expect(component.adminsInEvent()).toEqual([users[0]]);
		expect(component.otherUsersInEvent()).toEqual([users[1]]);
	});

	describe('onInit', () => {
		it('should set current user', () => {
			const currentUser = { id: '1' } as User;
			authServiceSpy.getCurrentUser.mockReturnValue(of(currentUser));
			const { component } = createComponent({ adminIds: ['1'] });
			component.ngOnInit();

			expect(component.currentUser()).toEqual(currentUser);
		});

		it('should show error message if loading users fails', () => {
			userServiceSpy.loadUsersByEvent.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent();
			component.ngOnInit();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading event settings');
		});

		it('should show error message if loading current user fails', () => {
			authServiceSpy.getCurrentUser.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent();
			component.ngOnInit();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Error loading event settings');
		});
	});

	describe('editEvent', () => {
		it('should show error message if editing event fails', () => {
			eventServiceSpy.editEvent.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent();
			component.editEvent();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to edit event');
		});

		it('should show success message and reload page if editing event succeeds', async () => {
			eventServiceSpy.editEvent.mockReturnValue(of({ id: '10' } as PuddingEvent));
			const { component } = createComponent();
			await component.editEvent();

			expect(component.event).toEqual({ id: '10' });
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Event successfully edited');
			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', '10', 'settings']);
		});
	});

	describe('setEventStatus', () => {
		it('should set event as ready to settle', async () => {
			eventServiceSpy.editEvent.mockReturnValue(of({ id: '10' } as PuddingEvent));
			const { component } = createComponent();
			await component.setStatus(EventStatusType.READY_TO_SETTLE);

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Event successfully ready to be settled');
			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', '10', 'settings']);
		});

		it('should settle event', async () => {
			eventServiceSpy.editEvent.mockReturnValue(of({ id: '10' } as PuddingEvent));
			const { component } = createComponent();
			await component.setStatus(EventStatusType.SETTLED);

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Event successfully settled');
			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', '10', 'settings']);
		});

		it('should set event as active', async () => {
			eventServiceSpy.editEvent.mockReturnValue(of({ id: '10' } as PuddingEvent));
			const { component } = createComponent({ status: { id: EventStatusType.SETTLED, name: 'Settled' } });
			await component.setStatus(EventStatusType.ACTIVE);

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Event successfully set as active');
			expect(routerSpy.navigate).toHaveBeenCalledWith(['events', '10', 'settings']);
		});

		it('should show error message if setting event as ready to settle fails', () => {
			eventServiceSpy.editEvent.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent();
			component.setStatus(EventStatusType.READY_TO_SETTLE);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change event status');
		});

		it('should show error message if settling event fails', () => {
			eventServiceSpy.editEvent.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent();
			component.setStatus(EventStatusType.SETTLED);

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to change event status');
		});
	});

	describe('deleteEvent', () => {
		it('should delete event', async () => {
			eventServiceSpy.deleteEvent.mockReturnValue(of(null));
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			await component.deleteEvent();

			expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
				width: '350px',
				data: {
					title: 'Delete event',
					content: 'Are you sure you want to delete this event? This cannot be undone.',
					confirm: 'Yes, I am sure',
				},
			});

			expect(eventServiceSpy.deleteEvent).toHaveBeenCalledWith('1');
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Event deleted successfully');
			expect(routerSpy.navigate).toHaveBeenCalledWith(['/events']);
		});

		it('should show error message if deleting event fails', async () => {
			eventServiceSpy.deleteEvent.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			await component.deleteEvent();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to delete event');
			expect(routerSpy.navigate).not.toHaveBeenCalled();
		});

		it('should not delete event if user cancels', async () => {
			eventServiceSpy.deleteEvent.mockReturnValue(of(null));
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			await component.deleteEvent();

			expect(eventServiceSpy.deleteEvent).not.toHaveBeenCalled();
			expect(routerSpy.navigate).not.toHaveBeenCalled();
		});
	});

	describe('addAdmin', () => {
		it('should add admin', async () => {
			eventServiceSpy.setUserAsAdmin.mockReturnValue(of({ id: '1', status: {}, adminIds: ['1', '2'] }));
			userServiceSpy.loadUsersByEvent.mockReturnValue(
				of([
					{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
					{ id: '2', eventInfo: { isAdmin: false }, avatarURL: 'url2' },
				] as User[]),
			);

			const { component } = createComponent({ adminIds: ['1'] });

			expect(component.adminsInEvent()).toEqual([{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' }]);
			expect(component.otherUsersInEvent()).toEqual([{ id: '2', eventInfo: { isAdmin: false }, avatarURL: 'url2' }]);

			component.addAdminForm.controls['userId'].setValue('2');
			await component.addAdmin();

			expect(component.event).toEqual({ id: '1', status: {}, adminIds: ['1', '2'] });
			expect(eventServiceSpy.setUserAsAdmin).toHaveBeenCalledWith('1', '2');
			expect(userServiceSpy.loadUsersByEvent).toHaveBeenCalledWith('1', true);
			expect(component.addAdminForm.controls['userId'].value).toEqual('');
			expect(component.adminsInEvent()).toEqual([
				{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
				{ id: '2', eventInfo: { isAdmin: false }, avatarURL: 'url2' },
			]);

			expect(component.otherUsersInEvent()).toEqual([] as User[]);
		});

		it('should show error message if adding admin fails', async () => {
			eventServiceSpy.setUserAsAdmin.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent({ adminIds: ['1'] });
			component.addAdminForm.controls['userId'].setValue('1');
			await component.addAdmin();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to add admin');
		});
	});

	describe('removeAdmin', () => {
		it('should remove admin', async () => {
			eventServiceSpy.removeUserAsAdmin.mockReturnValue(of({ id: '1', status: {}, adminIds: ['1'] }));
			userServiceSpy.loadUsersByEvent.mockReturnValue(
				of([
					{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
					{ id: '2', eventInfo: { isAdmin: true }, avatarURL: 'url2' },
				] as User[]),
			);
			const { component } = createComponent({ adminIds: ['1', '2'] });

			expect(component.event).toEqual(
				expect.objectContaining({
					id: '1',
					adminIds: ['1', '2'],
				}),
			);

			expect(component.adminsInEvent()).toEqual([
				{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
				{ id: '2', eventInfo: { isAdmin: true }, avatarURL: 'url2' },
			]);

			expect(component.otherUsersInEvent()).toEqual([]);

			await component.removeAdmin('2');

			expect(component.event).toEqual({ id: '1', status: {}, adminIds: ['1'] });
			expect(component.adminsInEvent()).toEqual([{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' }]);
			expect(component.otherUsersInEvent()).toEqual([{ id: '2', eventInfo: { isAdmin: true }, avatarURL: 'url2' }]);
			expect(eventServiceSpy.removeUserAsAdmin).toHaveBeenCalledWith('1', '2');
			expect(userServiceSpy.loadUsersByEvent).toHaveBeenCalledWith('1', true);
		});

		it('should ask before removing current user as admin', async () => {
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as MatDialogRef<boolean>);
			const { component } = createComponent({ adminIds: ['1', '2'] });
			await component.removeAdmin('1');

			expect(eventServiceSpy.removeUserAsAdmin).not.toHaveBeenCalled();
			expect(routerSpy.navigate).not.toHaveBeenCalled();
		});

		it('should remove current user as admin after asking', async () => {
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			eventServiceSpy.removeUserAsAdmin.mockReturnValue(of({ id: '1', status: {}, adminIds: ['1'] } as PuddingEvent));
			const { component } = createComponent({ adminIds: ['1', '2'] });
			await component.removeAdmin('1');

			expect(eventServiceSpy.removeUserAsAdmin).toHaveBeenCalledWith('1', '1');
			expect(routerSpy.navigate).toHaveBeenCalledWith(['/events']);
		});

		it('should show error message if removing admin fails', async () => {
			eventServiceSpy.removeUserAsAdmin.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			const { component } = createComponent({ adminIds: ['1', '2'] });
			await component.removeAdmin('2');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to remove admin');

			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			await component.removeAdmin('1');

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to remove current user as admin');
		});
	});

	describe('gotoUserProfile', () => {
		it('should navigate to user profile for non-guest user', () => {
			const { component } = createComponent();
			const user = { id: '1', username: 'testuser', guest: false } as User;
			component.gotoUserProfile(user);

			expect(routerSpy.navigate).toHaveBeenCalledWith(['u', 'testuser']);
		});

		it('should not navigate for guest user', () => {
			const { component } = createComponent();
			const user = { id: '1', username: 'guestuser', guest: true } as User;
			component.gotoUserProfile(user);

			expect(routerSpy.navigate).not.toHaveBeenCalled();
		});
	});

	describe('sendReadyToSettleEmails', () => {
		it('should send ready to settle emails when confirmed', async () => {
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			component.sendReadyToSettleEmails();

			expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
				width: '420px',
				data: {
					title: "Send 'ready to settle' email",
					content:
						"Are you sure you want to send the 'ready to settle' email? Emails will be sent to all participants in the event.",
					confirm: 'Yes, I am sure',
				},
			});

			expect(eventServiceSpy.sendReadyToSettleEmails).toHaveBeenCalledWith('1');
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Emails successfully sent');
		});

		it('should not send ready to settle emails when user cancels', () => {
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			component.sendReadyToSettleEmails();

			expect(eventServiceSpy.sendReadyToSettleEmails).not.toHaveBeenCalled();
		});

		it('should show error message if sending ready to settle emails fails', () => {
			eventServiceSpy.sendReadyToSettleEmails.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			component.sendReadyToSettleEmails();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to send emails');
		});
	});

	describe('sendAddExpensesReminderEmails', () => {
		it('should send add expenses reminder emails when confirmed', async () => {
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			const cutoffDate = new Date('2025-12-01');
			component.addExpensesCutoffDate.set(cutoffDate);
			component.sendAddExpensesReminderEmails();

			expect(dialogSpy.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
				width: '420px',
				data: {
					title: "Send 'add expenses reminder' email",
					content:
						"Are you sure you want to send the 'add expenses reminder' email? Emails will be sent to all participants in the event.",
					confirm: 'Yes, I am sure',
				},
			});

			expect(eventServiceSpy.sendAddExpensesReminderEmails).toHaveBeenCalledWith('1', cutoffDate);
			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Emails successfully sent');
			expect(component.addExpensesCutoffDate()).toBeNull();
		});

		it('should not send add expenses reminder emails when user cancels', () => {
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(false) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			component.sendAddExpensesReminderEmails();

			expect(eventServiceSpy.sendAddExpensesReminderEmails).not.toHaveBeenCalled();
		});

		it('should show error message if sending add expenses reminder emails fails', () => {
			eventServiceSpy.sendAddExpensesReminderEmails.mockReturnValue(throwError(() => ({ error: { message: 'error' } }) as ApiError));
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			component.sendAddExpensesReminderEmails();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Failed to send emails');
		});

		it('should show specific error message for PUD-150 error code', () => {
			eventServiceSpy.sendAddExpensesReminderEmails.mockReturnValue(
				throwError(() => ({ error: { code: 'PUD-150', message: 'Specific error message' } }) as ApiError),
			);
			dialogSpy.open.mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<boolean>);
			const { component } = createComponent();
			component.sendAddExpensesReminderEmails();

			expect(messageServiceSpy.showError).toHaveBeenCalledWith('Specific error message');
		});
	});

	describe('ngOnDestroy', () => {
		it('should unsubscribe from all subscriptions', () => {
			const { component } = createComponent();
			component.ngOnInit();

			const eventSubscriptionSpy = vi.spyOn(component['eventSubscription'], 'unsubscribe');

			component.ngOnDestroy();

			expect(eventSubscriptionSpy).toHaveBeenCalledWith();
		});

		it('should handle undefined subscriptions gracefully', () => {
			const { component } = createComponent();

			expect(() => component.ngOnDestroy()).not.toThrow();
		});
	});

	describe('addAdmin success message', () => {
		it('should show success message when admin is added', async () => {
			eventServiceSpy.setUserAsAdmin.mockReturnValue(of({ id: '1', status: {}, adminIds: ['1', '2'] }));
			userServiceSpy.loadUsersByEvent.mockReturnValue(
				of([
					{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
					{ id: '2', eventInfo: { isAdmin: false }, avatarURL: 'url2' },
				] as User[]),
			);

			const { component } = createComponent({ adminIds: ['1'] });
			component.addAdminForm.controls['userId'].setValue('2');
			await component.addAdmin();

			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Admin added successfully');
		});
	});

	describe('removeAdmin success message', () => {
		it('should show success message when admin is removed', async () => {
			eventServiceSpy.removeUserAsAdmin.mockReturnValue(of({ id: '1', status: {}, adminIds: ['1'] }));
			userServiceSpy.loadUsersByEvent.mockReturnValue(
				of([
					{ id: '1', eventInfo: { isAdmin: true }, avatarURL: 'url1' },
					{ id: '2', eventInfo: { isAdmin: true }, avatarURL: 'url2' },
				] as User[]),
			);
			const { component } = createComponent({ adminIds: ['1', '2'] });
			await component.removeAdmin('2');

			expect(messageServiceSpy.showSuccess).toHaveBeenCalledWith('Admin removed successfully');
		});
	});
});
