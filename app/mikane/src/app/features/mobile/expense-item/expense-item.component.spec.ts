import { CurrencyPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MockPipe } from 'ng-mocks';
import { Expense } from 'src/app/services/expense/expense.service';
import { ExpenseItemComponent } from './expense-item.component';

describe('ExpenseItemComponent', () => {
	let component: ExpenseItemComponent;
	let fixture: ComponentFixture<ExpenseItemComponent>;
	let expense: Expense;
	let routerSpy: jasmine.SpyObj<Router>;
	let routeSpy: jasmine.SpyObj<ActivatedRoute>;

	beforeEach(() => {
		routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
		const activatedRouteSnapshot = new ActivatedRouteSnapshot();
		routeSpy = jasmine.createSpyObj<ActivatedRoute>('ActivatedRoute', [], { snapshot: activatedRouteSnapshot });
		const fakeTransform = (...args: string[]) => JSON.stringify(args);
		TestBed.configureTestingModule({
			declarations: [MockPipe(CurrencyPipe, jasmine.createSpy().and.callFake(fakeTransform))],
			imports: [ExpenseItemComponent],
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
		component.expense = expense;
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
		expect(amountEl.textContent).toContain(expense.amount);
	});

	it('should show expense icon', () => {
		const iconEl = fixture.debugElement.query(By.css('.expense-icon')).nativeElement;
		expect(iconEl.textContent).toContain(expense.categoryInfo.icon);
	});

	it('should show shopping cart icon if category is not set', () => {
		component.expense.categoryInfo = null;
		fixture.detectChanges();
		const iconEl = fixture.debugElement.query(By.css('.expense-icon')).nativeElement;
		expect(iconEl.textContent).toContain('shopping_cart');
	});

	it('should navigate to expense details when gotoExpense is called', () => {
		component.gotoExpense();
		expect(routerSpy.navigate).toHaveBeenCalledWith([expense.id], { relativeTo: routeSpy });
	});
});
