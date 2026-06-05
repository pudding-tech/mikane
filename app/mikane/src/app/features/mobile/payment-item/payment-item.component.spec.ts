import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import localeNo from '@angular/common/locales/no';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { By } from '@angular/platform-browser';
import { User } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentItemComponent } from './payment-item.component';

describe('PaymentItemComponent', () => {
	let component: PaymentItemComponent;
	let fixture: ComponentFixture<PaymentItemComponent>;

	beforeAll(() => {
		registerLocaleData(localeNo);
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				PaymentItemComponent,
				CommonModule,
				MatIconModule,
				MatListModule,
				MatButtonModule,
				MatFormFieldModule,
				MatInputModule,
				FormsModule,
				FormControlPipe,
				ReactiveFormsModule,
			],
			providers: [CurrencyPipe],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PaymentItemComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('payment', {
			sender: { id: '1', name: 'Sender', eventInfo: { currency: 'NOK' } } as User,
			receivers: [
				{ receiver: { id: '2', name: 'Receiver 1' } as User, amount: 50 },
				{ receiver: { id: '3', name: 'Receiver 2' } as User, amount: 50 },
			],
		});
		fixture.componentRef.setInput('self', false);
		fixture.componentRef.setInput('currentUser', { id: '1', name: 'Sender' } as User);
		fixture.detectChanges();
	});

	afterEach(() => {
		vi.useRealTimers();
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

	// Regression guard
	it('should render the amount when the sender has no eventInfo', () => {
		fixture.componentRef.setInput('payment', {
			sender: { id: '1', name: 'Sender' } as User,
			receivers: [{ receiver: { id: '2', name: 'Receiver 1' } as User, amount: 50 }],
		});

		expect(() => fixture.detectChanges()).not.toThrow();

		const amountEl = fixture.debugElement.query(By.css('.amount-color')).nativeElement;
		expect(amountEl.textContent).toContain('50');
	});

	it('should toggle the dropdown when the toggleDropdown method is called', () => {
		const dropdownToggledSpy = vi.fn();
		component.dropdownToggled.subscribe(dropdownToggledSpy);

		component.toggleDropdown();

		expect(dropdownToggledSpy).toHaveBeenCalledWith({
			senderId: component.payment().sender.id,
			expanded: true,
			self: component.self(),
		});
		expect(component.dropdownOpen()).toBe(false);
	});

	it('should set lowerHeight to 0 when dropdown is closed', () => {
		vi.useFakeTimers();

		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		fixture.componentRef.setInput('expanded', true);
		fixture.detectChanges();
		vi.runOnlyPendingTimers();

		fixture.componentRef.setInput('expanded', false);
		fixture.detectChanges();

		expect(component.lowerHeight()).toEqual(0);
	});

	it('should set lowerHeight to scrollHeight when dropdown is opened', () => {
		vi.useFakeTimers();

		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		fixture.componentRef.setInput('expanded', true);
		fixture.detectChanges();
		vi.runOnlyPendingTimers();

		expect(component.lowerHeight()).toEqual(100);
	});

	it('should set lowerHeight 0 if self is false', () => {
		expect(component.lowerHeight()).toEqual(0);
	});

	it('should set lowerHeight to scrollHeight when self is true', async () => {
		vi.useFakeTimers();

		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		fixture.componentRef.setInput('self', true);
		fixture.componentRef.setInput('expanded', true);
		fixture.detectChanges();

		vi.runOnlyPendingTimers();

		expect(component.lowerHeight()).toEqual(100);
	});

	it('should reset disableTransition after initial suppressed open', () => {
		vi.useFakeTimers();
		const rafCallbacks: FrameRequestCallback[] = [];

		const requestAnimationFrameSpy = vi
			.spyOn(globalThis, 'requestAnimationFrame')
			.mockImplementation((cb: FrameRequestCallback) => {
				rafCallbacks.push(cb);
				return rafCallbacks.length;
			});

		const localFixture = TestBed.createComponent(PaymentItemComponent);
		const localComponent = localFixture.componentInstance;
		localFixture.componentRef.setInput('payment', {
			sender: { id: '1', name: 'Sender', eventInfo: { currency: 'NOK' } } as User,
			receivers: [
				{ receiver: { id: '2', name: 'Receiver 1' } as User, amount: 50 },
				{ receiver: { id: '3', name: 'Receiver 2' } as User, amount: 50 },
			],
		});
		localFixture.componentRef.setInput('self', false);
		localFixture.componentRef.setInput('currentUser', { id: '1', name: 'Sender' } as User);
		localFixture.componentRef.setInput('expanded', true);
		localFixture.detectChanges();

		expect(localComponent.disableTransition()).toBe(true);

		vi.runOnlyPendingTimers();
		while (rafCallbacks.length > 0) {
			const callback = rafCallbacks.shift();
			callback?.(0);
		}
		localFixture.detectChanges();

		expect(requestAnimationFrameSpy).toHaveBeenCalled();
		expect(localComponent.disableTransition()).toBe(false);
		expect(localFixture.debugElement.query(By.css('.lower')).nativeElement.classList.contains('no-transition')).toBe(false);
	});
});
