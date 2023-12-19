import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";

@Injectable({
	providedIn: 'root'
})
export class ScrollService {
	private ticking = false;

	private scrollPositionSubject = new BehaviorSubject<number>(0);
	scrollPosition$ = this.scrollPositionSubject.asObservable();

	constructor() {
		window.addEventListener('scroll', () => this.handleScroll());
		window.addEventListener('resize', () => this.handleScroll());
	}

	handleScroll(): void {
		if (!this.ticking) {
			window.requestAnimationFrame(() => {
				const lastKnownScrollY = window.scrollY || document.documentElement.scrollTop;
				this.ticking = false;

				this.scrollPositionSubject.next(lastKnownScrollY);
			});

			this.ticking = true;
		}
	}

	isScrolledToBottom(): Observable<boolean> {
		return this.scrollPosition$.pipe(
			map(scrollTop => {
				const scrollHeight = document.documentElement.scrollHeight;
				const clientHeight = window.innerHeight;

				// If scrolling is not possible, consider it as not scrolled to the bottom
				if (scrollHeight <= clientHeight) {
					return false;
				}

				return scrollTop + clientHeight >= scrollHeight;
			})
		);
	}
}
