import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SplitButtonItemDirective } from './split-button-item.directive';

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
			providers: [],
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
