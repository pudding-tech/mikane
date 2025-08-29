import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class BreakpointService {
	private breakpointObserver = inject(BreakpointObserver);

	/**
	 * Returns observable that emits true if screen is mobile and false otherwise.
	 *
	 * Ex. 1:
	 *
	 * @if(breakpointService.isMobile() | async)
	 *
	 * Ex. 2:
	 *
	 * [ngClass]="{ mobile: breakpointService.isMobile() | async }"
	 */
	isMobile(): Observable<boolean> {
		return this.breakpointObserver.observe(Breakpoints.HandsetPortrait).pipe(
			map((result) => {
				if (result?.matches) {
					return true;
				} else {
					return false;
				}
			}),
		);
	}
}
