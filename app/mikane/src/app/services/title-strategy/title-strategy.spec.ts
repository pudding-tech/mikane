import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { EventService } from '../event/event.service';
import { MikaneTitleStrategy } from './title-strategy';

describe('Mikane Title Strategy', () => {
	let titleStrategy: MikaneTitleStrategy;
	let titleService: Title;
	let eventService: EventService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MikaneTitleStrategy,
				{
					provide: Title,
					useValue: {
						setTitle: vi.fn(),
					},
				},
				{
					provide: EventService,
					useValue: {
						getEventName: vi.fn(),
					},
				},
			],
		});

		titleStrategy = TestBed.inject(MikaneTitleStrategy);
		titleService = TestBed.inject(Title);
		eventService = TestBed.inject(EventService);
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

		it('should set titlel with event name when eventId is present', () => {
			const eventId = 'test-id';
			const eventName = 'Test Event';
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);
			vi.spyOn(eventService, 'getEventName').mockReturnValue(of(eventName));

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} - ${eventName} | Mikane`);
		});

		it('should set title without event name when eventName is empty', () => {
			const eventId = 'test-id';
			const eventName = '';
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);
			vi.spyOn(eventService, 'getEventName').mockReturnValue(of(eventName));

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(routeTitle);
		});

		it('should set title without event name when eventName is null', () => {
			const eventId = 'test-id';
			const eventName: string | null = null;
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);
			vi.spyOn(eventService, 'getEventName').mockReturnValue(of(eventName));

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(routeTitle);
		});

		it('should set basic title when no eventId is present', () => {
			const routeTitle = 'Expenditures';
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} | Mikane`);
		});

		it('should set default title when no route title is present and no eventId', () => {
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue('');

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith('Mikane');
		});

		it('should set default title when buildTitle returns null and no eventId is present', () => {
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(null);

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith('Mikane');
		});

		it('should handle missing firstChild gracefully', () => {
			const mockSnapshotWithoutChild = {
				root: {
					firstChild: null,
				},
			} as RouterStateSnapshot;
			const routeTitle = 'Expenditures';
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);

			titleStrategy.updateTitle(mockSnapshotWithoutChild);

			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} | Mikane`);
		});

		it('should handle missing nested firstChild gracefully', () => {
			const mockSnapshotWithoutNestedChild = {
				root: {
					firstChild: {
						firstChild: null,
					},
				},
			} as RouterStateSnapshot;
			const routeTitle = 'Expenditures';
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);

			titleStrategy.updateTitle(mockSnapshotWithoutNestedChild);

			expect(eventService.getEventName).not.toHaveBeenCalled();
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} | Mikane`);
		});

		it('should extract eventId from deeply nested route params', () => {
			const eventId = 'test-id';
			const eventName = 'Test Event';
			const routeTitle = 'Expenditures';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId, otherId: 'other' };
			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue(routeTitle);
			vi.spyOn(eventService, 'getEventName').mockReturnValue(of(eventName));

			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(`${routeTitle} - ${eventName} | Mikane`);
		});

		it('should work with empty route title and event name', () => {
			const eventId = 'test-id';
			const eventName = 'Test Event';
			mockSnapshot.root.firstChild!.firstChild!.params = { eventId };
			vi.spyOn(eventService, 'getEventName').mockReturnValue(of(eventName));

			vi.spyOn(titleStrategy, 'buildTitle').mockReturnValue('');
			titleStrategy.updateTitle(mockSnapshot);

			expect(eventService.getEventName).toHaveBeenCalledWith(eventId);
			expect(titleService.setTitle).toHaveBeenCalledWith(` - ${eventName} | Mikane`);
		});
	});
});
