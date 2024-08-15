import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockBuilder, MockRender, MockedComponentFixture } from 'ng-mocks';
import { FormValidationService } from 'src/app/services/form-validation/form-validation.service';
import { CategoryIcon } from 'src/app/types/enums';
import { CategoryDialogComponent } from './category-dialog.component';

describe('CategoryDialogComponent', () => {
	let component: CategoryDialogComponent;
	let fixture: MockedComponentFixture<CategoryDialogComponent>;

	let matDialogRefSpy: jasmine.SpyObj<MatDialogRef<CategoryDialogComponent>>;

	const data = {
		name: 'Test',
		weighted: true,
		eventId: '1',
		categoryId: '1',
		icon: CategoryIcon.FOOD,
	};

	beforeEach(async () => {
		matDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

		return MockBuilder(CategoryDialogComponent)
			.provide({ provide: MatDialogRef, useValue: matDialogRefSpy })
			.provide({ provide: MAT_DIALOG_DATA, useValue: data })
			.provide({ provide: FormValidationService, useValue: jasmine.createSpyObj('FormValidationService', ['validateCategoryName']) });
	});

	beforeEach(() => {
		fixture = MockRender(CategoryDialogComponent);
		component = fixture.point.componentInstance;

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
				jasmine.objectContaining({
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
			fixture.point.nativeElement.querySelector('button').click();

			expect(component.isOpen).toBeTruthy();
		});

		it('should close the icon overlay', () => {
			fixture.point.nativeElement.querySelector('button').click();

			const icon = CategoryIcon.FOOD;
			component.iconChange(icon);

			expect(component.isOpen).toBeFalsy();
		});
	});
});
