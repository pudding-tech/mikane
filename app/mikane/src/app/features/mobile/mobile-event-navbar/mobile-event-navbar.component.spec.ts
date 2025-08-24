import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ContextService } from 'src/app/services/context/context.service';
import { MobileEventNavbarComponent } from './mobile-event-navbar.component';

describe('MobileEventNavbarComponent', () => {
	let component: MobileEventNavbarComponent;
	let fixture: ComponentFixture<MobileEventNavbarComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [MobileEventNavbarComponent, MatIconModule, MatRippleModule, RouterTestingModule],
			providers: [
				{ provide: ContextService, useValue: { isIos: () => false } },
				{ provide: ActivatedRoute, useValue: {} },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(MobileEventNavbarComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('activeLink', '/events');
		fixture.componentRef.setInput('links', [
			{ name: 'Link 1', icon: 'icon1', location: '/link1' },
			{ name: 'Link 2', icon: 'icon2', location: '/link2' },
		]);
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
