import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { User, UserBalance } from '../../../services/user/user.service';
import { ParticipantItemComponent } from './participant-item.component';

describe('ParticipantItemComponent', () => {
	let component: ParticipantItemComponent;
	let fixture: ComponentFixture<ParticipantItemComponent>;
	let userBalance: UserBalance;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ParticipantItemComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ParticipantItemComponent);
		component = fixture.componentInstance;
		userBalance = {
			user: {
				id: '1',
				name: 'Test User',
				avatarURL: 'avatar.png',
				eventInfo: { isAdmin: false, currency: 'NOK' },
			},
			expensesCount: 3,
			spending: 100,
			expenses: 50,
			balance: -50,
		} as UserBalance;

		fixture.componentRef.setInput('userBalance', userBalance);
		fixture.componentRef.setInput('eventActive', true);
		fixture.componentRef.setInput('numberOfParticipants', 4);
		fixture.componentRef.setInput('numberOfAdmins', 2);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the participant name', () => {
		const nameEl = fixture.debugElement.query(By.css('.name')).nativeElement;

		expect(nameEl.textContent).toContain('Test User');
	});

	it('should display the balances in the provided currency', () => {
		const balancesEl = fixture.debugElement.query(By.css('.balances')).nativeElement;

		expect(balancesEl.textContent).toContain('kr');
		expect(balancesEl.textContent).toContain('100');
		expect(balancesEl.textContent).toContain('50');
	});

	it('should emit gotoUser with the user when gotoUserProfile is called', () => {
		let emitted: { user: User } | undefined;
		component.gotoUser.subscribe((event) => (emitted = event));

		component.gotoUserProfile();

		expect(emitted).toEqual({ user: userBalance.user });
	});

	it('should emit removeUser with the user when removeUserFromEvent is called', () => {
		let emitted: { user: User } | undefined;
		component.removeUser.subscribe((event) => (emitted = event));

		component.removeUserFromEvent();

		expect(emitted).toEqual({ user: userBalance.user });
	});
});
