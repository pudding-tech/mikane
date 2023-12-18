import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Category } from 'src/app/services/category/category.service';
import { User } from 'src/app/services/user/user.service';
import { CategoryIcon } from 'src/app/types/enums';
import { CategoryItemComponent } from './category-item.component';

describe('CategoryItemComponent', () => {
	let component: CategoryItemComponent;
	let fixture: ComponentFixture<CategoryItemComponent>;
	let category: Category;
	let user: User;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CategoryItemComponent],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(CategoryItemComponent);
		component = fixture.componentInstance;
		user = { id: '1', name: 'Test User' } as User;
		category = {
			id: '1',
			name: 'Test Category',
			icon: CategoryIcon.SHOPPING,
			users: [user],
			weighted: false,
			numberOfExpenses: 0,
			created: new Date(),
		} as Category;
		component.category = category;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should display the category name', () => {
		const nameEl = fixture.debugElement.query(By.css('.upper .name')).nativeElement;

		expect(nameEl.textContent).toContain(category.name);
	});

	it('should display the user name', () => {
		const userEl = fixture.debugElement.query(By.css('.user.data .name')).nativeElement;

		expect(userEl.textContent).toContain(user.name);
	});

	it('should display the category icon', () => {
		const iconEl = fixture.debugElement.query(By.css('.upper .category-icon')).nativeElement;

		expect(iconEl.textContent).toContain(category.icon);
	});

	it('should toggle the dropdown when toggleDropdown is called', () => {
		component.dropdownOpen = false;
		component.toggleDropdown();

		expect(component.dropdownOpen).toBeTrue();
		component.toggleDropdown();

		expect(component.dropdownOpen).toBeFalse();
	});

	it('should set lowerHeight to scrollHeight when toggleDropdown is called', () => {
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		component.toggleDropdown();

		expect(component.lowerHeight).toEqual(100);
	});

	it('should set lowerHeight to 0 when toggleDropdown is called and dropdown is open', () => {
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		component.toggleDropdown();

		expect(component.lowerHeight).toEqual(100);
		component.toggleDropdown();

		expect(component.lowerHeight).toEqual(0);
	});

	it('should set lowerHeight after 100ms when addUserToCategory is called', fakeAsync(() => {
		component.lower = { nativeElement: { scrollHeight: 100 } } as ElementRef;
		component.addUserToCategory(category.id);

		expect(component.lowerHeight).toEqual(0);
		tick(100);

		expect(component.lowerHeight).toEqual(100);
	}));

	it('should emit addUser event when addUserToCategory is called', () => {
		spyOn(component.addUser, 'emit');
		component.addUserToCategory(category.id);

		expect(component.addUser.emit).toHaveBeenCalledWith({ categoryId: category.id });
	});

	it('should emit removeUser event when removeUserFromCategory is called', () => {
		spyOn(component.removeUser, 'emit');
		component.removeUserFromCategory(category.id, user.id);

		expect(component.removeUser.emit).toHaveBeenCalledWith({ categoryId: category.id, userId: user.id });
	});

	it('should emit openEditCategoryDialog event when openEditCategoryDialog is called', () => {
		spyOn(component.openEditCategoryDialog, 'emit');
		component.openEdit(category.id, category.name, category.icon);

		expect(component.openEditCategoryDialog.emit).toHaveBeenCalledWith({
			categoryId: category.id,
			name: category.name,
			icon: category.icon,
		});
	});

	it('should emit openWeightEditDialog event when openEditWeight is called', () => {
		spyOn(component.openWeightEditDialog, 'emit');
		component.openEditWeight(category.id, user.id, 1);

		expect(component.openWeightEditDialog.emit).toHaveBeenCalledWith({
			categoryId: category.id,
			userId: user.id,
			weight: 1,
		});
	});

	it('should emit toggleWeighted event when toggleWeightedCategory is called', () => {
		spyOn(component.toggleWeighted, 'emit');
		component.toggleWeightedCategory(category.id, true);

		expect(component.toggleWeighted.emit).toHaveBeenCalledWith({ categoryId: category.id, weighted: true });
	});

	it('should emit deleteCategoryDialog event when deleteCategory is called', () => {
		spyOn(component.deleteCategoryDialog, 'emit');
		component.deleteCategory(category.id);

		expect(component.deleteCategoryDialog.emit).toHaveBeenCalledWith({ categoryId: category.id });
	});
});
