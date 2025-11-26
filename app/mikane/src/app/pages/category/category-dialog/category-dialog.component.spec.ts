import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { CategoryIcon } from 'src/app/types/enums';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryDialogComponent } from './category-dialog.component';

describe('CategoryDialogComponent', () => {
	let component: CategoryDialogComponent;
	let fixture: ComponentFixture<CategoryDialogComponent>;
	let matDialogRefSpy: { close: ReturnType<typeof vi.fn> };
	let formValidationServiceSpy: { validateCategoryName: ReturnType<typeof vi.fn> };

	const data = {
		name: 'Test',
		weighted: true,
		eventId: '1',
		categoryId: '1',
		icon: CategoryIcon.FOOD,
	};

	beforeEach(async () => {
		matDialogRefSpy = { close: vi.fn() };
		formValidationServiceSpy = { validateCategoryName: vi.fn() };

		TestBed.configureTestingModule({
			imports: [CategoryDialogComponent],
			providers: [
				{ provide: MatDialogRef, useValue: matDialogRefSpy },
				{ provide: MAT_DIALOG_DATA, useValue: data },
				{ provide: FormValidationService, useValue: formValidationServiceSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CategoryDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		fixture.destroy();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should create the form', () => {
			expect(component.addCategoryForm).toBeTruthy();
		});

		it('should patch the form', () => {
			component.data = data;

			component.ngOnInit();
			fixture.detectChanges();

			expect(component.addCategoryForm.value).toEqual(
				expect.objectContaining({
					categoryName: data.name,
					weighted: false,
					selectedIcon: data.icon,
				}),
			);
		});
	});

	describe('getErrorMessage', () => {
		it('should return the error message', () => {
			component.addCategoryForm.get('categoryName').setErrors({ required: true });

			expect(component.getErrorMessage()).toEqual('You must enter a value');
		});

		it('should return an empty string', () => {
			expect(component.getErrorMessage()).toEqual('');
		});
	});

	describe('onNoClick', () => {
		it('should close the dialog', () => {
			component.onNoClick();

			expect(matDialogRefSpy.close).toHaveBeenCalledWith();
		});
	});

	describe('iconChange', () => {
		it('should set the selected icon', () => {
			const icon = CategoryIcon.FOOD;
			component.iconChange(icon);

			expect(component.addCategoryForm.get('selectedIcon').value).toEqual(icon);
		});

		it('should open the icon overlay', () => {
			const button = fixture.nativeElement.querySelector('button');
			button.click();

			expect(component.isOpen).toBeTruthy();
		});

		it('should close the icon overlay', () => {
			const button = fixture.nativeElement.querySelector('button');
			button.click();

			const icon = CategoryIcon.FOOD;
			component.iconChange(icon);

			expect(component.isOpen).toBeFalsy();
		});
	});
});
