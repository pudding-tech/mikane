import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, vi } from 'vitest';
import { ScrollService } from './scroll.service';

describe('ScrollService', () => {
	let service: ScrollService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ScrollService],
		});

		service = TestBed.inject(ScrollService);

		// Stub requestAnimationFrame to run the callback immediately
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			cb(performance.now());
			return 0;
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should emit scroll position on scroll event', () => {
		let emittedScrollPosition: number | undefined;

		service.scrollPosition$.subscribe((scrollPosition) => {
			emittedScrollPosition = scrollPosition;
		});

		// Simulate a scroll event
		window.dispatchEvent(new Event('scroll'));

		expect(emittedScrollPosition).toBeDefined();
	});

	it('should emit scroll position on resize event', () => {
		let emittedScrollPosition: number | undefined;

		service.scrollPosition$.subscribe((scrollPosition) => {
			emittedScrollPosition = scrollPosition;
		});

		// Simulate a resize event
		window.dispatchEvent(new Event('resize'));

		expect(emittedScrollPosition).toBeDefined();
	});
});
