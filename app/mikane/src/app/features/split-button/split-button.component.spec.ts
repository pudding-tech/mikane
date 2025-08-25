import { CommonModule } from '@angular/common';
import { Directive, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { SplitButtonItemDirective } from './split-button-item/split-button-item.directive';
import { SplitButtonComponent } from './split-button.component';

@Directive({
  selector: '[appSplitButtonItem]',
  standalone: true,
})
class MockSplitButtonItemDirective {}

describe('SplitButtonComponent', () => {
	let component: SplitButtonComponent;
	let fixture: ComponentFixture<SplitButtonComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SplitButtonComponent, CommonModule, MatButtonToggleModule, MatIconModule, MockSplitButtonItemDirective],
			providers: [
				{
					provide: BreakpointService,
					useValue: {
						isMobile: () => of(false),
					},
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SplitButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit the onClick event when the button is clicked', () => {
		const spy = vi.spyOn(component.splitButtonClick, 'emit');
		const buttonEl = fixture.debugElement.query(By.css('.split-button.main-button')).nativeElement;
		buttonEl.click();

		expect(spy).toHaveBeenCalledWith();
	});

	it('should toggle the dropdown when the toggleDropdown method is called', () => {
		const initialDropdownOpen = component.toggled;
		component.toggleDropdown();

		expect(component.toggled).toEqual(!initialDropdownOpen);
	});

	it('should close the dropdown when a click event occurs outside the component', () => {
		component.toggled = true;
		const outsideEl = document.createElement('div');
		document.body.appendChild(outsideEl);
		outsideEl.click();

		expect(component.toggled).toBeFalsy();
	});

	it('should ignore outside click events when the dropdown is closed', () => {
		component.toggled = false;
		const outsideEl = document.createElement('div');
		document.body.appendChild(outsideEl);
		outsideEl.click();

		expect(component.toggled).toBeFalsy();
	});

	it('should not close the dropdown when a click event occurs inside the component', () => {
		component.toggled = true;
		const insideEl = fixture.debugElement.query(By.css('.split-button.main-button')).nativeElement;
		insideEl.click();

		expect(component.toggled).toBeTruthy();
	});

	it('should have the correct number of items', () => {
		component.items = Object.assign(new QueryList(), {
			_results: [
				{ id: '1', name: 'Item 1' },
				{ id: '2', name: 'Item 2' },
				{ id: '3', name: 'Item 3' },
			],
		}) as QueryList<SplitButtonItemDirective>;

		fixture.detectChanges();
		const items = fixture.debugElement.queryAll(By.directive(SplitButtonItemDirective));

		expect(items.length).toEqual(component.items.length);
	});
});
