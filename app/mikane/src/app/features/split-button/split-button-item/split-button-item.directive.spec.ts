import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitButtonItemDirective } from './split-button-item.directive';
import { describe, it, beforeEach, expect } from 'vitest';

@Component({
	template: `<ng-template appSplitButtonItem>Test Item</ng-template>`,
	standalone: true,
	imports: [SplitButtonItemDirective],
})
class TestHostComponent {
	@ViewChild(SplitButtonItemDirective) directiveInstance: SplitButtonItemDirective;
}

describe('SplitButtonItemDirective', () => {
	let fixture: ComponentFixture<TestHostComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [TestHostComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(TestHostComponent);
		fixture.detectChanges();
	});

	it('should create the directive instance', () => {
		expect(fixture.componentInstance.directiveInstance).toBeTruthy();
	});

	it('should have a templateRef', () => {
		expect(fixture.componentInstance.directiveInstance.templateRef).toBeTruthy();
	});
});
