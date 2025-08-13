import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MockBuilder, MockRender } from 'ng-mocks';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { ContextService } from 'src/app/services/context/context.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { EventSettingsComponent } from './event-settings.component';

describe('EventSettingsComponent', () => {
	beforeEach(() =>
		MockBuilder(EventSettingsComponent)
			.provide({
				provide: EventService,
				useValue: {
					editEvent: jasmine.createSpy('editEvent').and.returnValue(of({})),
					deleteEvent: jasmine.createSpy('deleteEvent').and.returnValue(of({})),
					setUserAsAdmin: jasmine.createSpy('setUserAsAdmin').and.returnValue(of({})),
					removeUserAsAdmin: jasmine.createSpy('removeUserAsAdmin').and.returnValue(of({})),
				},
			})
			.provide({
				provide: UserService,
				useValue: {
					loadUsersByEvent: jasmine.createSpy('loadUsersByEvent').and.returnValue(of([])),
				},
			})
			.provide({
				provide: AuthService,
				useValue: {
					getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue(of({ id: '1' })),
				},
			})
			.provide({
				provide: ContextService,
				useValue: jasmine.createSpyObj('ContextService', [], ['isMobileDevice']),
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: jasmine.createSpy('showError'),
					showSuccess: jasmine.createSpy('showSuccess'),
				},
			})
			.provide({
				provide: MatDialog,
				useValue: {
					open: jasmine.createSpy('open'),
				},
			})
			.provide({
				provide: Router,
				useValue: {
					navigate: jasmine.createSpy('navigate'),
					navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(),
				},
			})
	);

	it('should create', () => {
		const fixture = TestBed.createComponent(EventSettingsComponent);
		const component = fixture.componentInstance;

		expect(component).toBeTruthy();
	});

	it('should set event data', () => {
		const $event = new BehaviorSubject<PuddingEvent>({
			id: '1',
			name: 'test',
			description: 'test',
			status: {
				id: EventStatusType.ACTIVE,
				name: 'Active',
			},
			adminIds: [],
		} as PuddingEvent);

		const fixture = MockRender(EventSettingsComponent, { $event: $event });
		const component = fixture.point.componentInstance;
		fixture.detectChanges();
		component.ngOnInit();

		expect(component.eventData.id).toEqual('1');
		expect(component.eventData.name).toEqual('test');
		expect(component.eventData.description).toEqual('test');
	});

	it('should set event admins and other users', () => {
		const $event = new BehaviorSubject<PuddingEvent>({
			id: '1',
			name: 'test',
			description: 'test',
			status: {
				id: EventStatusType.ACTIVE,
				name: 'Active',
			},
			adminIds: ['1'],
		} as PuddingEvent);

		const fixture = MockRender(EventSettingsComponent, { $event: $event });
		const component = fixture.point.componentInstance;

		const users = [
			{ id: '1', eventInfo: { isAdmin: true } },
			{ id: '2', eventInfo: { isAdmin: false } },
		] as User[];
		(fixture.point.injector.get(UserService) as jasmine.SpyObj<UserService>).loadUsersByEvent.and.returnValue(of(users));
		fixture.detectChanges();
		component.ngOnInit();

		expect(component.adminsInEvent).toEqual([users[0]]);
		expect(component.otherUsersInEvent).toEqual([users[1]]);
	});

	describe('onInit', () => {
		it('should set current user', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				name: 'test',
				description: 'test',
				status: {
					id: EventStatusType.ACTIVE,
					name: 'Active',
				},
				adminIds: ['1'],
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;

			const currentUser = { id: '1' } as User;
			(fixture.point.injector.get(AuthService) as jasmine.SpyObj<AuthService>).getCurrentUser.and.returnValue(of(currentUser));
			fixture.detectChanges();
			component.ngOnInit();

			expect(component.currentUser).toEqual(currentUser);
		});

		it('should show error message if loading users fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);
			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			(fixture.point.injector.get(UserService) as jasmine.SpyObj<UserService>).loadUsersByEvent.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			fixture.detectChanges();
			component.ngOnInit();

			expect(messageService.showError).toHaveBeenCalledWith('Error loading event settings');
		});

		it('should show error message if loading current user fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);
			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			(fixture.point.injector.get(AuthService) as jasmine.SpyObj<AuthService>).getCurrentUser.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			fixture.detectChanges();
			component.ngOnInit();

			expect(messageService.showError).toHaveBeenCalledWith('Error loading event settings');
		});
	});

	describe('editEvent', () => {
		it('should show error message if editing event fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);
			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			fixture.detectChanges();
			component.editEvent();

			expect(messageService.showError).toHaveBeenCalledWith('Failed to edit event');
		});

		it('should show success message and reload page if editing event succeeds', fakeAsync(() => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;

			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				of({ id: '10' } as PuddingEvent)
			);
			tick();
			fixture.detectChanges();
			component.editEvent();

			tick();

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageService.showSuccess).toHaveBeenCalledWith('Event successfully edited');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).toHaveBeenCalledWith([
				'events',
				'10',
				'settings',
			]);
		}));
	});

	describe('setEventStatus', () => {
		it('should set event as ready to settle', fakeAsync(() => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {
					id: EventStatusType.ACTIVE,
					name: 'Active',
				},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;

			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				of({ id: '10' } as PuddingEvent)
			);
			tick();
			fixture.detectChanges();
			component.setStatus(EventStatusType.READY_TO_SETTLE);

			tick();

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageService.showSuccess).toHaveBeenCalledWith('Event successfully ready to be settled');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).toHaveBeenCalledWith([
				'events',
				'10',
				'settings',
			]);
		}));

		it('should settle event', fakeAsync(() => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {
					id: EventStatusType.ACTIVE,
					name: 'Active',
				},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;

			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				of({ id: '10' } as PuddingEvent)
			);
			tick();
			fixture.detectChanges();
			component.setStatus(EventStatusType.SETTLED);

			tick();

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageService.showSuccess).toHaveBeenCalledWith('Event successfully settled');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).toHaveBeenCalledWith([
				'events',
				'10',
				'settings',
			]);
		}));

		it('should set event as active', fakeAsync(() => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {
					id: EventStatusType.SETTLED,
					name: 'Settled',
				},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;

			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				of({ id: '10' } as PuddingEvent)
			);
			tick();
			fixture.detectChanges();
			component.setStatus(EventStatusType.ACTIVE);

			tick();

			expect(component.event).toEqual({ id: '10' } as PuddingEvent);
			expect(messageService.showSuccess).toHaveBeenCalledWith('Event successfully set as active');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).toHaveBeenCalledWith([
				'events',
				'10',
				'settings',
			]);
		}));

		it('should show error message if setting event as ready to settle fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;

			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			fixture.detectChanges();
			component.setStatus(EventStatusType.READY_TO_SETTLE);

			expect(messageService.showError).toHaveBeenCalledWith('Failed to change event status');
		});

		it('should show error message if settling event fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;

			(fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>).editEvent.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			fixture.detectChanges();
			component.setStatus(EventStatusType.SETTLED);

			expect(messageService.showError).toHaveBeenCalledWith('Failed to change event status');
		});
	});

	describe('deleteEvent', () => {
		it('should delete event', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			eventService.deleteEvent.and.returnValue(of(null));
			(fixture.point.injector.get(MatDialog) as jasmine.SpyObj<MatDialog>).open.and.returnValue({
				afterClosed: () => of(true),
			} as MatDialogRef<boolean>);

			fixture.detectChanges();
			component.deleteEvent();

			expect(eventService.deleteEvent).toHaveBeenCalledWith('1');
			expect(messageService.showSuccess).toHaveBeenCalledWith('Event deleted successfully');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).toHaveBeenCalledWith(['/events']);
		});

		it('should show error message if deleting event fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			eventService.deleteEvent.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			(fixture.point.injector.get(MatDialog) as jasmine.SpyObj<MatDialog>).open.and.returnValue({
				afterClosed: () => of(true),
			} as MatDialogRef<boolean>);

			fixture.detectChanges();
			component.deleteEvent();

			expect(messageService.showError).toHaveBeenCalledWith('Failed to delete event');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).not.toHaveBeenCalled();
		});

		it('should not delete event if user cancels', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			eventService.deleteEvent.and.returnValue(of(null));
			(fixture.point.injector.get(MatDialog) as jasmine.SpyObj<MatDialog>).open.and.returnValue({
				afterClosed: () => of(false),
			} as MatDialogRef<boolean>);

			fixture.detectChanges();
			component.deleteEvent();

			expect(eventService.deleteEvent).not.toHaveBeenCalled();
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).not.toHaveBeenCalled();
		});
	});

	describe('addAdmin', () => {
		it('should add admin', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
				adminIds: ['1'],
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;
			const userService = fixture.point.injector.get(UserService) as jasmine.SpyObj<UserService>;

			component.addAdminForm.controls['userId'].setValue('2');

			eventService.setUserAsAdmin.and.returnValue(
				of({
					id: '1',
					status: {},
					adminIds: ['1', '2'],
				} as PuddingEvent)
			);
			userService.loadUsersByEvent.and.returnValue(
				of([
					{ id: '1', eventInfo: { isAdmin: true } },
					{ id: '2', eventInfo: { isAdmin: false } },
				] as User[])
			);
			fixture.detectChanges();
			component.ngOnInit();

			expect(component.adminsInEvent).toEqual([{ id: '1', eventInfo: { isAdmin: true } }] as User[]);
			expect(component.otherUsersInEvent).toEqual([{ id: '2', eventInfo: { isAdmin: false } }] as User[]);
			component.addAdmin();

			expect(component.event).toEqual({
				id: '1',
				status: {},
				adminIds: ['1', '2'],
			} as PuddingEvent);

			expect(eventService.setUserAsAdmin).toHaveBeenCalledWith('1', '2');
			expect(userService.loadUsersByEvent).toHaveBeenCalledWith('1', true);
			expect(component.addAdminForm.controls['userId'].value).toEqual('');
			expect(component.adminsInEvent).toEqual([
				{ id: '1', eventInfo: { isAdmin: true } },
				{ id: '2', eventInfo: { isAdmin: false } },
			] as User[]);

			expect(component.otherUsersInEvent).toEqual([] as User[]);
		});

		it('should show error message if adding admin fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			component.addAdminForm.controls['userId'].setValue('1');

			eventService.setUserAsAdmin.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);
			fixture.detectChanges();
			component.addAdmin();

			expect(messageService.showError).toHaveBeenCalledWith('Failed to add admin');
		});
	});

	describe('removeAdmin', () => {
		it('should remove admin', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
				adminIds: ['1', '2'],
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;
			const userService = fixture.point.injector.get(UserService) as jasmine.SpyObj<UserService>;

			eventService.removeUserAsAdmin.and.returnValue(
				of({
					id: '1',
					status: {},
					adminIds: ['1'],
				} as PuddingEvent)
			);
			userService.loadUsersByEvent.and.returnValue(
				of([
					{ id: '1', eventInfo: { isAdmin: true } },
					{ id: '2', eventInfo: { isAdmin: true } },
				] as User[])
			);
			fixture.detectChanges();
			component.ngOnInit();

			expect(component.event).toEqual({
				id: '1',
				status: {},
				adminIds: ['1', '2'],
			} as PuddingEvent);

			expect(component.adminsInEvent).toEqual([
				{ id: '1', eventInfo: { isAdmin: true } },
				{ id: '2', eventInfo: { isAdmin: true } },
			] as User[]);

			expect(component.otherUsersInEvent).toEqual([] as User[]);

			component.removeAdmin('2');

			expect(component.event).toEqual({
				id: '1',
				status: {},
				adminIds: ['1'],
			} as PuddingEvent);

			expect(component.adminsInEvent).toEqual([{ id: '1', eventInfo: { isAdmin: true } }] as User[]);
			expect(component.otherUsersInEvent).toEqual([{ id: '2', eventInfo: { isAdmin: true } }] as User[]);
			expect(eventService.removeUserAsAdmin).toHaveBeenCalledWith('1', '2');
			expect(userService.loadUsersByEvent).toHaveBeenCalledWith('1', true);
		});

		it('should ask before removing current user as admin', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
				adminIds: ['1', '2'],
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			(fixture.point.injector.get(MatDialog) as jasmine.SpyObj<MatDialog>).open.and.returnValue({
				afterClosed: () => of(false),
			} as MatDialogRef<boolean>);
			fixture.detectChanges();
			component.ngOnInit();
			component.removeAdmin('1');

			expect(eventService.removeUserAsAdmin).not.toHaveBeenCalled();
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).not.toHaveBeenCalled();
		});

		it('should remove current user as admin after asking', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
				adminIds: ['1', '2'],
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			(fixture.point.injector.get(MatDialog) as jasmine.SpyObj<MatDialog>).open.and.returnValue({
				afterClosed: () => of(true),
			} as MatDialogRef<boolean>);
			fixture.detectChanges();
			component.ngOnInit();
			component.removeAdmin('1');

			expect(eventService.removeUserAsAdmin).toHaveBeenCalledWith('1', '1');
			expect((fixture.point.injector.get(Router) as jasmine.SpyObj<Router>).navigate).toHaveBeenCalledWith(['/events']);
		});

		it('should show error message if removing admin fails', () => {
			const $event = new BehaviorSubject<PuddingEvent>({
				id: '1',
				status: {},
				adminIds: ['1', '2'],
			} as PuddingEvent);

			const fixture = MockRender(EventSettingsComponent, { $event: $event });
			const component = fixture.point.componentInstance;
			const messageService = fixture.point.injector.get(MessageService) as jasmine.SpyObj<MessageService>;
			const eventService = fixture.point.injector.get(EventService) as jasmine.SpyObj<EventService>;

			eventService.removeUserAsAdmin.and.returnValue(
				throwError(() => {
					return {
						error: {
							message: 'error',
						},
					} as ApiError;
				})
			);

			fixture.detectChanges();
			component.ngOnInit();
			component.removeAdmin('2');

			expect(messageService.showError).toHaveBeenCalledWith('Failed to remove admin');

			(fixture.point.injector.get(MatDialog) as jasmine.SpyObj<MatDialog>).open.and.returnValue({
				afterClosed: () => of(true),
			} as MatDialogRef<boolean>);

			component.removeAdmin('1');

			expect(messageService.showError).toHaveBeenCalledWith('Failed to remove current user as admin');
		});
	});
});
