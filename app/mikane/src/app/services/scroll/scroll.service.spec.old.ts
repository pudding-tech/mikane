import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
	let service: ScrollService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ScrollService],
		});

		service = TestBed.inject(ScrollService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should emit scroll position on scroll event', fakeAsync(() => {
		let emittedScrollPosition: number | undefined;

		service.scrollPosition$.subscribe((scrollPosition) => {
			emittedScrollPosition = scrollPosition;
		});

		// Simulate a scroll event
		window.dispatchEvent(new Event('scroll'));

		// Advance the clock to allow for the debounce time in the handleScroll function
		tick(100);

		expect(emittedScrollPosition).toBeDefined();
	}));

	it('should emit scroll position on resize event', fakeAsync(() => {
		let emittedScrollPosition: number | undefined;

		service.scrollPosition$.subscribe((scrollPosition) => {
			emittedScrollPosition = scrollPosition;
		});

		// Simulate a resize event
		window.dispatchEvent(new Event('resize'));

		// Advance the clock to allow for the debounce time in the handleScroll function
		tick(100);

		expect(emittedScrollPosition).toBeDefined();
	}));
});
