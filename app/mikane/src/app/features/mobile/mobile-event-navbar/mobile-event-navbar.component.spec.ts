import { inputBinding, signal, twoWayBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContextService } from 'src/app/services/context/context.service';
import { MobileEventNavbarComponent } from './mobile-event-navbar.component';
import { of } from 'rxjs';

describe('MobileEventNavbarComponent', () => {
	let component: MobileEventNavbarComponent;
	let fixture: ComponentFixture<MobileEventNavbarComponent>;
	const activeLink = signal('/participants');

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MobileEventNavbarComponent],
			providers: [
				{ provide: ContextService, useValue: { isIosPwaStandalone: () => false } },
				{ provide: ActivatedRoute, useValue: { snapshot: { params: {} }, params: of({}) } },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MobileEventNavbarComponent, {
			bindings: [
				twoWayBinding('activeLink', activeLink),
				inputBinding('links', () => [
					{ name: 'Link 1', icon: 'person', location: '/participants' },
					{ name: 'Link 2', icon: 'payment', location: '/expenses' },
				]),
			]
		});
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the back button', () => {
		const backButtonEl = fixture.debugElement.query(By.css('.nav-back-button')).nativeElement;

		expect(backButtonEl).toBeTruthy();
	});

	it('should display the correct number of links', () => {
		const linkEls = fixture.debugElement.queryAll(By.css('.nav-button'));
		// Back arrow counts as its own link and is always present
		expect(linkEls.length).toEqual(component.links().length + 1);
	});

	it('should set the active class on the active link', () => {
		const activeLinkEl = fixture.debugElement.query(By.css('.active')).nativeElement;

		expect(activeLinkEl.getAttribute('href')).toEqual(component.activeLink());
	});
});
