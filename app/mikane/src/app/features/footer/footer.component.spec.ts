import { CommonModule } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { beforeEach, describe, expect, it } from 'vitest';
import packageJson from '../../../../package.json';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
	let component: FooterComponent;
	let fixture: ComponentFixture<FooterComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FooterComponent, CommonModule],
			providers: [
				{
					provide: BreakpointService,
					useValue: {
						isMobile: () => false,
					},
				},
				{
					provide: Router,
					useValue: {
						url: '/events',
					},
				},
				provideZonelessChangeDetection(),
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the correct version number', () => {
		expect(component.version).toEqual(packageJson.version);
	});

	it('should return true if the current page is included', () => {
		expect(component.showFooter()).toBeTruthy();
	});

	it('should return false if the current page is not included', () => {
		TestBed.resetTestingModule();
		TestBed.configureTestingModule({
			imports: [FooterComponent, CommonModule],
			providers: [
				{
					provide: BreakpointService,
					useValue: {
						isMobile: () => false,
					},
				},
				{
					provide: Router,
					useValue: {
						url: '/test',
					},
				},
			],
		}).compileComponents();
		fixture = TestBed.createComponent(FooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();

		expect(component.showFooter()).toBeFalsy();
	});
});
