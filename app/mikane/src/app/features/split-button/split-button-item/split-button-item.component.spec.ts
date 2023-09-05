import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { MockModule } from 'ng-mocks';
import { SplitButtonItemComponent } from './split-button-item.component';

describe('SplitButtonItemComponent', () => {
	let component: SplitButtonItemComponent;
	let fixture: ComponentFixture<SplitButtonItemComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [SplitButtonItemComponent, MockModule(MatIconModule), MockModule(MatRippleModule)],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SplitButtonItemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit the onClick event when the button is clicked', () => {
		spyOn(component.onClick, 'emit');
		const buttonEl = fixture.debugElement.query(By.css('a')).nativeElement;
		buttonEl.click();
		expect(component.onClick.emit).toHaveBeenCalled();
	});

	it('should display the correct icon', () => {
		component.icon = 'test-icon';
		fixture.detectChanges();
		const iconEl = fixture.debugElement.query(By.css('.icon')).nativeElement;
		expect(iconEl.textContent).toContain('test-icon');
	});

	it('should display the correct text', () => {
		component.text = 'test-text';
		fixture.detectChanges();
		const textEl = fixture.debugElement.query(By.css('.text')).nativeElement;
		expect(textEl.textContent).toContain('test-text');
	});
});
