import { CommonModule, CurrencyPipe } from '@angular/common';
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
		component.sender = {
			sender: { id: '1', name: 'Sender' } as User,
			receivers: [
				{ receiver: { id: '2', name: 'Receiver 1' } as User, amount: 50 },
				{ receiver: { id: '3', name: 'Receiver 2' } as User, amount: 50 },
			],
		};
		component.self = false;
		component.currentUser = { id: '1', name: 'Sender' } as User;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the sender name', () => {
		const senderNameEl = fixture.debugElement.query(By.css('.upper .name')).nativeElement;
		expect(senderNameEl.textContent).toContain(component.sender.sender.name);
	});

	it('should display the correct number of receivers', () => {
		const receiverEls = fixture.debugElement.queryAll(By.css('.lower .name'));
		expect(receiverEls.length).toEqual(component.sender.receivers.length);
	});

	it('should display the correct receiver name and amount', () => {
		const receiverEls = fixture.debugElement.queryAll(By.css('.payment'));
		component.sender.receivers.forEach((receiver, index) => {
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
		component.lower = { nativeElement: { scrollHeight: 100 } } as any;
		component.toggleDropdown();
		expect(component.lowerHeight).toEqual(100);
	});

	it('should set lowerHeight 0 if self is false', () => {
		expect(component.lowerHeight).toEqual(0);
	});

	it('should set lowerHeight to scrollHeight when self is true', fakeAsync(() => {
		component.self = true;
		component.lower = { nativeElement: { scrollHeight: 100 } } as any;
		component.ngOnInit();
		fixture.detectChanges();
		tick();
		expect(component.lowerHeight).toEqual(100);
	}));
});
