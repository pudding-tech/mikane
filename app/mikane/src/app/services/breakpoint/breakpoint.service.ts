import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class BreakpointService {
	constructor(private breakpointObserver: BreakpointObserver) {}

	/**
	 * Returns observable that emits true if screen is mobile and false otherwise.
	 *
	 * Ex. 1:
	 *
	 * *ngIf="breakpointService.isMobile() | async"
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
			})
		);
	}
}
