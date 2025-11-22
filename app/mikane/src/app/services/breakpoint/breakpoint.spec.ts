import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { throwError } from 'rxjs/internal/observable/throwError';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreakpointService } from './breakpoint.service';

describe('BreakpointService', () => {
	let service: BreakpointService;
	let breakpointObserverMock: BreakpointObserver;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				BreakpointService,
				{
					provide: BreakpointObserver,
					useValue: {
						observe: vi.fn(),
					},
				},
			],
		});

		service = TestBed.inject(BreakpointService);
		breakpointObserverMock = TestBed.inject(BreakpointObserver);
	});

	it('#isMobile should return true if screne size matches HandsetPortrait breakpoint', () => {
		vi.spyOn(breakpointObserverMock, 'observe').mockImplementation((breakpoint: string | readonly string[]) => {
			if (breakpoint === Breakpoints.HandsetPortrait) {
				return of({ matches: true } as BreakpointState);
			} else {
				return throwError(() => new Error('wrong breakpoint'));
			}
		});

		let result: boolean;

		service.isMobile().subscribe({
			next: (match: boolean) => {
				result = match;
			},
		});

		expect(result).toBe(true);
	});

	it('#isMobile should return false if screen size does not match HandsetPortrait breakpoint', () => {
		vi.spyOn(breakpointObserverMock, 'observe').mockImplementation((breakpoint: string | readonly string[]) => {
			if (breakpoint === Breakpoints.HandsetPortrait) {
				return of({ matches: false } as BreakpointState);
			} else {
				return throwError(() => new Error('wrong breakpoint'));
			}
		});

		let result: boolean;

		service.isMobile().subscribe({
			next: (match: boolean) => {
				result = match;
			},
		});

		expect(result).toBe(false);
	});
});
