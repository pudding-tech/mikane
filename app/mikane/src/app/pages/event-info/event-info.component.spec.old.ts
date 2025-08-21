import { AsyncPipe } from '@angular/common';
import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { EventInfoComponent } from './event-info.component';

describe('EventInfoComponent', () => {
	let component: EventInfoComponent;
	let fixture: MockedComponentFixture<EventInfoComponent, { $event: Observable<PuddingEvent> }>;
	let loadUsersByEventSpy: jasmine.Spy;
	let getCurrentUserSpy: jasmine.Spy;
	let showErrorSpy: jasmine.Spy;

	async function createComponent() {
		await MockBuilder(EventInfoComponent)
			.mock(AsyncPipe)
			.provide({
				provide: UserService,
				useValue: {
					loadUsersByEvent: loadUsersByEventSpy,
				},
			})
			.provide({
				provide: AuthService,
				useValue: {
					getCurrentUser: getCurrentUserSpy,
				},
			})
			.provide({
				provide: MessageService,
				useValue: {
					showError: showErrorSpy,
				},
			})
			.mock(LogService);

		fixture = MockRender(EventInfoComponent, {
			$event: of({
				id: 'test',
				name: 'test',
				description: 'test',
				adminIds: [],
			} as PuddingEvent),
		});
		component = fixture.point.componentInstance;
		fixture.detectChanges();
	}

	describe('', () => {
		beforeEach(() => {
			loadUsersByEventSpy = jasmine.createSpy('loadUsersByEvent').and.returnValue(
				of([
					{ id: 'test', name: 'test', eventInfo: { isAdmin: true } },
					{ id: 'test2', name: 'test2', eventInfo: { isAdmin: false } },
				] as User[]),
			);
			getCurrentUserSpy = jasmine.createSpy('getCurrentUser').and.returnValue(of({ id: 'test' } as User));
			showErrorSpy = jasmine.createSpy('showError');

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
			} as PuddingEvent);
		});

		it('should get current user', () => {
			expect(component.currentUser).toEqual({ id: 'test' } as User);
		});

		it('should filter users by admin', () => {
			expect(component.adminsInEvent).toEqual([{ id: 'test', name: 'test', eventInfo: { isAdmin: true } }] as User[]);
		});
	});

	describe('from user service', () => {
		beforeEach(() => {
			loadUsersByEventSpy = jasmine.createSpy('loadUsersByEvent').and.returnValue(throwError(() => 'test error'));
			showErrorSpy = jasmine.createSpy('showError');
			return createComponent();
		});

		it('should show user error message', () => {
			expect(showErrorSpy).toHaveBeenCalledWith('Error loading event settings');
		});
	});

	describe('from auth service', () => {
		beforeEach(() => {
			getCurrentUserSpy = jasmine.createSpy('getCurrentUser').and.returnValue(throwError(() => 'test error'));
			showErrorSpy = jasmine.createSpy('showError');
			return createComponent();
		});

		it('should show auth error message', () => {
			expect(showErrorSpy).toHaveBeenCalledWith('Error loading event settings');
		});
	});
});
