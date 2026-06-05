import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from 'src/app/services/user/user.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentExpansionPanelItemComponent } from './payment-expansion-panel-item.component';

describe('PaymentExpansionPanelItemComponent', () => {
	let component: PaymentExpansionPanelItemComponent;
	let fixture: ComponentFixture<PaymentExpansionPanelItemComponent>;
	let routerSpy: { navigate: ReturnType<typeof vi.fn> };

	const sender = {
		id: '1',
		name: 'Sender',
		username: 'sender',
		guest: false,
		avatarURL: 'sender.png',
		eventInfo: { currency: 'NOK' },
	} as User;
	const receiver = { id: '2', name: 'Receiver', username: 'receiver', guest: false, avatarURL: 'receiver.png' } as User;

	beforeEach(() => {
		routerSpy = { navigate: vi.fn() };

		TestBed.configureTestingModule({
			imports: [PaymentExpansionPanelItemComponent],
			providers: [{ provide: Router, useValue: routerSpy }],
		}).compileComponents();

		fixture = TestBed.createComponent(PaymentExpansionPanelItemComponent);
		component = fixture.componentInstance;
		fixture.componentRef.setInput('payments', [{ sender, receivers: [{ receiver, amount: 50 }] }]);
		// `self` expands the panel, which renders the (lazy) receivers table.
		fixture.componentRef.setInput('self', true);
		fixture.componentRef.setInput('currentUser', { id: '9' } as User);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the sender name', () => {
		const titleEl = fixture.debugElement.query(By.css('mat-panel-title')).nativeElement;

		expect(titleEl.textContent).toContain('Sender');
	});

	it('should display the receiver amount in the sender currency', () => {
		const amountEl = fixture.debugElement.query(By.css('.amount-cell')).nativeElement;

		expect(amountEl.textContent).toContain('50');
		expect(amountEl.textContent).toContain('kr');
	});

	it('should navigate to a non-guest user profile', () => {
		component.gotoUserProfile(sender);

		expect(routerSpy.navigate).toHaveBeenCalledWith(['u', 'sender']);
	});

	it('should not navigate for a guest user', () => {
		component.gotoUserProfile({ id: '3', username: 'guest', guest: true } as User);

		expect(routerSpy.navigate).not.toHaveBeenCalled();
	});

	// Regression guard
	it('should render the amount when the sender has no eventInfo', () => {
		fixture.componentRef.setInput('payments', [
			{
				sender: { id: '1', name: 'Sender', username: 'sender', guest: false, avatarURL: 'sender.png' } as User,
				receivers: [{ receiver, amount: 50 }],
			},
		]);

		expect(() => fixture.detectChanges()).not.toThrow();

		const amountEl = fixture.debugElement.query(By.css('.amount-cell')).nativeElement;
		expect(amountEl.textContent).toContain('50');
	});
});
