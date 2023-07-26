import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { BreakpointService } from './breakpoint.service';

describe('BreakpointService', () => {
	let service: BreakpointService;
	let breakpointObserverSpy: jasmine.SpyObj<BreakpointObserver>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				BreakpointService,
				{ provide: BreakpointObserver, useValue: jasmine.createSpyObj('BreakpointObserver', ['observe']) },
			],
		});

		service = TestBed.inject(BreakpointService);
		breakpointObserverSpy = TestBed.inject(BreakpointObserver) as jasmine.SpyObj<BreakpointObserver>;
	});

	it('#isMobile should return true if screen size matches HandsetProtrait breakpoint', () => {
		breakpointObserverSpy.observe.and.callFake((breakpoint) => {
			if (breakpoint === Breakpoints.HandsetPortrait) {
				return of({ matches: true } as BreakpointState);
			} else {
				return throwError(() => new Error('wrong breakpoint'));
			}
		});

		service.isMobile().subscribe({
			next: (match: boolean) => {
				expect(match).withContext('should match breakpoint').toBe(true);
			},
			error: fail,
		});
	});

	it('#isMobile should return false if screen size does not match HandsetProtrait breakpoint', () => {
		breakpointObserverSpy.observe.and.callFake((breakpoint) => {
			if (breakpoint === Breakpoints.HandsetPortrait) {
				return of({ matches: false } as BreakpointState);
			} else {
				return throwError(() => new Error('wrong breakpoint'));
			}
		});

		service.isMobile().subscribe({
			next: (match: boolean) => {
				expect(match).withContext('should not match breaktpoint').toBe(false);
			},
			error: fail,
		});
	});
});
