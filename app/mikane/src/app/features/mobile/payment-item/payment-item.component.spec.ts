import { CommonModule, CurrencyPipe } from '@angular/common';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { MockModule, MockPipe } from 'ng-mocks';
import { User } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { PaymentItemComponent } from './payment-item.component';

describe('PaymentItemComponent', () => {
	let component: PaymentItemComponent;
	let fixture: ComponentFixture<PaymentItemComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [
				FormControlPipe,
				MockPipe(
					CurrencyPipe,
					jasmine.createSpy().and.callFake((...args: string[]) => JSON.stringify(args))
				),
			],
			imports: [
				PaymentItemComponent,
				CommonModule,
				MockModule(MatIconModule),
				MockModule(MatListModule),
				MockModule(MatButtonModule),
				MockModule(MatFormFieldModule),
				MockModule(MatInputModule),
				FormsModule,
				ReactiveFormsModule,
			],
			providers: [CurrencyPipe],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PaymentItemComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('payment', {
			sender: { id: '1', name: 'Sender' } as User,
			receivers: [
				{ receiver: { id: '2', name: 'Receiver 1' } as User, amount: 50 },
				{ receiver: { id: '3', name: 'Receiver 2' } as User, amount: 50 },
			],
		});
		fixture.componentRef.setInput('self', false);
		fixture.componentRef.setInput('currentUser', { id: '1', name: 'Sender' } as User);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the sender name', () => {
		const senderNameEl = fixture.debugElement.query(By.css('.upper .name')).nativeElement;

		expect(senderNameEl.textContent).toContain(component.payment().sender.name);
	});

	it('should display the correct number of receivers', () => {
		const receiverEls = fixture.debugElement.queryAll(By.css('.lower .name'));

		expect(receiverEls.length).toEqual(component.payment().receivers.length);
	});

	it('should display the correct receiver name and amount', () => {
		const receiverEls = fixture.debugElement.queryAll(By.css('.payment'));
		component.payment().receivers.forEach((receiver, index) => {
			const nameEl = receiverEls[index].query(By.css('.name')).nativeElement;
			const amountEl = receiverEls[index].query(By.css('.amount-color')).nativeElement;

			expect(nameEl.textContent).toContain(receiver.receiver.name);
			expect(amountEl.textContent).toContain(receiver.amount);
		});
	});

	it('should toggle the dropdown when the toggleDropdown method is called', () => {
		const initialDropdownOpen = component.dropdownOpen;
		component.toggleDropdown();

		expect(component.dropdownOpen).toEqual(!initialDropdownOpen);
	});

	it('should set lowerHeight to 0 when dropdown is closed', () => {
		component.toggleDropdown();
		component.toggleDropdown();

		expect(component.lowerHeight).toEqual(0);
	});

	it('should set lowerHeight to scrollHeight when dropdown is opened', () => {
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		component.toggleDropdown();

		expect(component.lowerHeight).toEqual(100);
	});

	it('should set lowerHeight 0 if self is false', () => {
		expect(component.lowerHeight).toEqual(0);
	});

	it('should set lowerHeight to scrollHeight when self is true', fakeAsync(() => {
		fixture.componentRef.setInput('self', true);
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		component.ngOnInit();
		fixture.detectChanges();
		tick();

		expect(component.lowerHeight).toEqual(100);
	}));

	it('should expand when forceExpanded is true', () => {
		fixture.componentRef.setInput('forceExpanded', true);
		fixture.componentRef.setInput('self', false); // Normally would be collapsed
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		component.ngOnInit();

		expect(component.dropdownOpen).toBe(true);
	});

	it('should collapse when forceExpanded is false', () => {
		fixture.componentRef.setInput('forceExpanded', false);
		fixture.componentRef.setInput('self', true); // Normally would be expanded
		component.ngOnInit();

		expect(component.dropdownOpen).toBe(false);
		expect(component.lowerHeight).toEqual(0);
	});

	it('should not allow manual toggle when forceExpanded is set', () => {
		fixture.componentRef.setInput('forceExpanded', true);
		component.ngOnInit();
		const initialDropdownOpen = component.dropdownOpen;
		
		component.toggleDropdown();

		expect(component.dropdownOpen).toEqual(initialDropdownOpen); // Should not change
	});

	it('should allow manual toggle when forceExpanded is undefined', () => {
		fixture.componentRef.setInput('forceExpanded', undefined);
		component.ngOnInit();
		const initialDropdownOpen = component.dropdownOpen;
		
		component.toggleDropdown();

		expect(component.dropdownOpen).toEqual(!initialDropdownOpen); // Should change
	});

	it('should respond to changes in forceExpanded', () => {
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		
		// Start with undefined (manual control)
		fixture.componentRef.setInput('forceExpanded', undefined);
		fixture.componentRef.setInput('self', false);
		component.ngOnInit();
		expect(component.dropdownOpen).toBe(false);

		// Change to force expanded
		fixture.componentRef.setInput('forceExpanded', true);
		component.ngOnChanges({ forceExpanded: { currentValue: true, previousValue: undefined, firstChange: false, isFirstChange: () => false } });
		expect(component.dropdownOpen).toBe(true);

		// Change to force collapsed
		fixture.componentRef.setInput('forceExpanded', false);
		component.ngOnChanges({ forceExpanded: { currentValue: false, previousValue: true, firstChange: false, isFirstChange: () => false } });
		expect(component.dropdownOpen).toBe(false);
	});
});
