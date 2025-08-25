import { registerLocaleData } from '@angular/common';
import localeNo from '@angular/common/locales/no';
import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Expense } from 'src/app/services/expense/expense.service';
import { ExpenseItemComponent } from './expense-item.component';

// Simple mock pipe for CurrencyPipe
@Pipe({ name: 'currency' })
class MockCurrencyPipe implements PipeTransform {
	transform(...args: unknown[]) {
		return JSON.stringify(args);
	}
}

describe('ExpenseItemComponent', () => {
	let component: ExpenseItemComponent;
	let fixture: ComponentFixture<ExpenseItemComponent>;
	let expense: Expense;
	let routerSpy: { navigate: ReturnType<typeof vi.fn> };
	let routeSpy: { snapshot: ActivatedRouteSnapshot };

	beforeAll(() => {
		registerLocaleData(localeNo);
	});

	beforeEach(() => {
		routerSpy = { navigate: vi.fn() };
		routeSpy = { snapshot: new ActivatedRouteSnapshot() };

		TestBed.configureTestingModule({
			imports: [ExpenseItemComponent, MockCurrencyPipe],
			providers: [
				{ provide: Router, useValue: routerSpy },
				{ provide: ActivatedRoute, useValue: routeSpy },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ExpenseItemComponent);
		component = fixture.componentInstance;
		expense = {
			id: '1',
			name: 'Test Expense',
			amount: 100,
			payer: {
				id: '1',
				name: 'Test User',
				email: '',
			},
			categoryInfo: {
				id: '1',
				name: 'Test Category',
				icon: 'shopping',
			},
		} as Expense;
		fixture.componentRef.setInput('expense', expense);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the expense name', () => {
		const nameEl = fixture.debugElement.query(By.css('.title')).nativeElement;

		expect(nameEl.textContent).toContain(expense.name);
	});

	it('should display the expense category', () => {
		const categoryEl = fixture.debugElement.query(By.css('.category')).nativeElement;

		expect(categoryEl.textContent).toContain(expense.categoryInfo.name);
	});

	it('should display the expense payer', () => {
		const payerEl = fixture.debugElement.query(By.css('.payer-name')).nativeElement;

		expect(payerEl.textContent).toContain(expense.payer.name);
	});

	it('should display the expense amount', () => {
		const amountEl = fixture.debugElement.query(By.css('.amount-color-darker')).nativeElement;

		expect(amountEl.textContent).toContain(expense.amount.toString());
	});

	it('should show expense icon', () => {
		const iconEl = fixture.debugElement.query(By.css('.expense-icon')).nativeElement;

		expect(iconEl.textContent).toContain(expense.categoryInfo.icon);
	});

	it('should show shopping cart icon if category is not set', () => {
		component.expense().categoryInfo = null;
		fixture.detectChanges();
		const iconEl = fixture.debugElement.query(By.css('.expense-icon')).nativeElement;

		expect(iconEl.textContent).toContain('shopping_cart');
	});

	it('should navigate to expense details when gotoExpense is called', () => {
		component.gotoExpense();

		expect(routerSpy.navigate).toHaveBeenCalledWith(
			[expense.id],
			{ relativeTo: routeSpy, queryParams: expect.any(Object) }
		);
	});
});
