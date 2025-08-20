import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { EventService } from '../event/event.service';
import { MikaneTitleStrategy } from './title-strategy';

describe('MikaneTitleStrategy', () => {
	let titleStrategy: MikaneTitleStrategy;
	let titleService: jasmine.SpyObj<Title>;
	let eventService: jasmine.SpyObj<EventService>;

	beforeEach(() => {
		const titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
		const eventServiceSpy = jasmine.createSpyObj('EventService', ['getEventName']);

		TestBed.configureTestingModule({
			providers: [MikaneTitleStrategy, { provide: Title, useValue: titleSpy }, { provide: EventService, useValue: eventServiceSpy }],
		});

		titleStrategy = TestBed.inject(MikaneTitleStrategy);
		titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
		eventService = TestBed.inject(EventService) as jasmine.SpyObj<EventService>;
	});

	describe('updateTitle', () => {
		let mockSnapshot: RouterStateSnapshot;

		beforeEach(() => {
			mockSnapshot = {
				root: {
					firstChild: {
						firstChild: {
							params: {},
						},
					},
				},
			} as RouterStateSnapshot;
		});

		it('should set title with event name when eventId is present', () => {
			// Arrange
			const eventId = 'test-event-id';
			const eventName = 'Test Event';
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);
			eventService.getEventName.and.returnValue(of(eventName));

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} - ${eventName} | Mikane`);
		});

		it('should set title without event name when eventName is empty', () => {
			// Arrange
			const eventId = 'test-event-id';
			const eventName = '';
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);
			eventService.getEventName.and.returnValue(of(eventName));

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(routeTitle);
		});

		it('should set title without event name when eventName is null', () => {
			// Arrange
			const eventId = 'test-event-id';
			const eventName: string | null = null;
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);
			eventService.getEventName.and.returnValue(of(eventName));

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(routeTitle);
		});

		it('should set basic title when no eventId is present', () => {
			// Arrange
			const routeTitle = 'Dashboard';
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} | Mikane`);
		});

		it('should set default title when no route title is present and no eventId', () => {
			// Arrange
			spyOn(titleStrategy, 'buildTitle').and.returnValue('');

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith('Mikane');
		});

		it('should set default title when buildTitle returns null and no eventId', () => {
			// Arrange
			spyOn(titleStrategy, 'buildTitle').and.returnValue(null);

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith('Mikane');
		});

		it('should handle missing firstChild gracefully', () => {
			// Arrange
			const mockSnapshotWithoutChild = {
				root: {
					firstChild: null,
				},
			} as RouterStateSnapshot;
			const routeTitle = 'Dashboard';
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);

			// Act
			titleStrategy.updateTitle(mockSnapshotWithoutChild);

			// Assert
			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} | Mikane`);
		});

		it('should handle missing nested firstChild gracefully', () => {
			// Arrange
			const mockSnapshotWithoutNestedChild = {
				root: {
					firstChild: {
						firstChild: null,
					},
				},
			} as RouterStateSnapshot;
			const routeTitle = 'Dashboard';
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);

			// Act
			titleStrategy.updateTitle(mockSnapshotWithoutNestedChild);

			// Assert
			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} | Mikane`);
		});

		it('should extract eventId from deeply nested route params', () => {
			// Arrange
			const eventId = 'deep-event-id';
			const eventName = 'Deep Event';
			const routeTitle = 'Categories';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId, otherId: 'other' };
			spyOn(titleStrategy, 'buildTitle').and.returnValue(routeTitle);
			eventService.getEventName.and.returnValue(of(eventName));

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} - ${eventName} | Mikane`);
		});

		it('should work with empty route title and event name', () => {
			// Arrange
			const eventId = 'test-event-id';
			const eventName = 'Test Event';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			spyOn(titleStrategy, 'buildTitle').and.returnValue('');
			eventService.getEventName.and.returnValue(of(eventName));

			// Act
			titleStrategy.updateTitle(mockSnapshot);

			// Assert
			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(' - Test Event | Mikane');
		});
	});
});
