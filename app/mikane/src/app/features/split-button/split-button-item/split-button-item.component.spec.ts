import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SplitButtonItemComponent } from './split-button-item.component';

describe('SplitButtonItemComponent', () => {
	let component: SplitButtonItemComponent;
	let fixture: ComponentFixture<SplitButtonItemComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SplitButtonItemComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SplitButtonItemComponent, {
			bindings: [
				inputBinding('icon', () => 'person'),
				inputBinding('text', () => 'test-text')
			]
		});
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit the onClick event when the button is clicked', () => {
		const spy = vi.spyOn(component.splitButtonClick, 'emit');
		const buttonEl = fixture.debugElement.query(By.css('a')).nativeElement as HTMLButtonElement;
		buttonEl.click();

		expect(spy).toHaveBeenCalledWith();
	});

	it('should emit the onClick event when the button is pressed', () => {
		const spy = vi.spyOn(component.splitButtonClick, 'emit');
		const buttonEl = fixture.debugElement.query(By.css('a')).nativeElement as HTMLButtonElement;
		buttonEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

		expect(spy).toHaveBeenCalledWith();
	});

	it('should display the correct icon', () => {
		const iconEl = fixture.debugElement.query(By.css('.icon')).nativeElement;

		expect(iconEl.textContent).toContain('person');
	});

	it('should display the correct text', () => {
		const textEl = fixture.debugElement.query(By.css('.text')).nativeElement;

		expect(textEl.textContent).toContain('test-text');
	});
});
