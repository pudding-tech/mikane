import { TestBed } from '@angular/core/testing';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { ExpenseBottomSheetComponent } from './expense-bottom-sheet.component';
import { describe, expect, it, vi } from 'vitest';
import { User } from 'src/app/services/user/user.service';
import { CategoryInfo } from 'src/app/pages/expenditures/expense-bottom-sheet/expense-bottom-sheet.component';

class EBSC extends ExpenseBottomSheetComponent {
	public override searchValue: string;
	public override payers: User[];
	public override categories: CategoryInfo[];
	public override selectedValues: string[];
}

const mockPayers = [
	{ id: 'u1', name: 'Alice', avatarURL: 'alice.png', guest: false, username: '', authenticated: false },
	{ id: 'u2', name: 'Bob', avatarURL: 'bob.png', guest: false, username: '', authenticated: false },
];

const mockCategories = [
	{ id: 'c1', name: 'Food', icon: 'restaurant' },
	{ id: 'c2', name: 'Travel', icon: 'flight' },
];

function createComponent(data: { type: 'search' | 'payers' | 'categories'; filterData?: User[] | CategoryInfo[]; currentFilter: string[] }) {
	TestBed.configureTestingModule({
		imports: [ExpenseBottomSheetComponent],
		providers: [
			{ provide: MAT_BOTTOM_SHEET_DATA, useValue: data },
		],
	}).compileComponents();

	const fixture = TestBed.createComponent(ExpenseBottomSheetComponent);
	const component = fixture.componentInstance;
	fixture.detectChanges();
	return { fixture, component };
}

describe('ExpenseBottomSheetComponent', () => {
	it('should create (search type)', () => {
		const { component } = createComponent({ type: 'search', currentFilter: ['pizza'] });

		expect(component).toBeTruthy();
		expect((component as EBSC).searchValue).toBe('pizza');
	});

	it('should create (payers type)', () => {
		const { component } = createComponent({ type: 'payers', filterData: mockPayers, currentFilter: [] });

		expect(component).toBeTruthy();
		expect((component as EBSC).payers).toEqual(mockPayers);
	});

	it('should create (categories type)', () => {
		const { component } = createComponent({ type: 'categories', filterData: mockCategories, currentFilter: [] });

		expect(component).toBeTruthy();
		expect((component as EBSC).categories).toEqual(mockCategories);
	});

	it('should select and deselect item', () => {
		const { component } = createComponent({ type: 'categories', filterData: mockCategories, currentFilter: [] });
		const spy = vi.spyOn(component.inputDataChange, 'emit');
		component.selectItem('c1');

		expect((component as EBSC).selectedValues).toContain('c1');
		expect(spy).toHaveBeenCalledWith(['c1']);
		component.selectItem('c1');

		expect((component as EBSC).selectedValues).not.toContain('c1');
		expect(spy).toHaveBeenCalledWith([]);
	});

	it('should apply search filter', () => {
		const { component } = createComponent({ type: 'search', currentFilter: ['pizza'] });
		const spy = vi.spyOn(component.inputDataChange, 'emit');
		(component as EBSC).searchValue = 'burger';
		component.applySearchFilter();

		expect(spy).toHaveBeenCalledWith(['burger']);
	});

	it('should clear input', () => {
		const { component } = createComponent({ type: 'search', currentFilter: ['pizza'] });
		const spy = vi.spyOn(component.inputDataChange, 'emit');
		(component as EBSC).searchValue = 'burger';
		component.clearInput();

		expect((component as EBSC).searchValue).toBe('');
		expect(spy).toHaveBeenCalledWith(['']);
	});
});
