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
		fixture.componentRef.setInput('icon', 'test-icon');
		fixture.componentRef.setInput('text', 'test-text');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit the onClick event when the button is clicked', () => {
		spyOn(component.splitButtonClick, 'emit');
		const buttonEl = fixture.debugElement.query(By.css('a')).nativeElement as HTMLButtonElement;
		buttonEl.click();

		expect(component.splitButtonClick.emit).toHaveBeenCalledWith();
	});

	it('should emit the onClick event when the button is pressed', () => {
		spyOn(component.splitButtonClick, 'emit');
		const buttonEl = fixture.debugElement.query(By.css('a')).nativeElement as HTMLButtonElement;
		buttonEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

		expect(component.splitButtonClick.emit).toHaveBeenCalledWith();
	});

	it('should display the correct icon', () => {
		const iconEl = fixture.debugElement.query(By.css('.icon')).nativeElement;

		expect(iconEl.textContent).toContain('test-icon');
	});

	it('should display the correct text', () => {
		const textEl = fixture.debugElement.query(By.css('.text')).nativeElement;

		expect(textEl.textContent).toContain('test-text');
	});
});
