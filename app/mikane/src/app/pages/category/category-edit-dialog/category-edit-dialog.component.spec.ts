import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoryEditDialogComponent } from './category-edit-dialog.component';

describe('CategoryEditDialogComponent', () => {
	let component: CategoryEditDialogComponent;
	let fixture: ComponentFixture<CategoryEditDialogComponent>;
	let page: Page;
	let matDialogRefSpy: { close: ReturnType<typeof vi.fn> };

	const data = {
		catId: 1,
		userId: 1,
		weight: 1,
	};

	beforeEach(async () => {
		matDialogRefSpy = { close: vi.fn() };

		await TestBed.configureTestingModule({
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: data },
				{ provide: MatDialogRef, useValue: matDialogRefSpy },
			],
			imports: [
				CategoryEditDialogComponent,
				MatDialogModule,
				FormsModule,
				ReactiveFormsModule,
				MatFormFieldModule,
				MatInputModule,
				MatButtonModule,
				NoopAnimationsModule,
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CategoryEditDialogComponent);
		component = fixture.componentInstance;
		page = new Page(fixture);

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
			expect(page.weightInput).toBeDefined();
			expect(page.weightInput.value).toEqual(data.weight.toString());
		});
	});

	describe('onNoClick', () => {
		it('should close the dialog', () => {
			component.onNoClick();

			expect(matDialogRefSpy.close).toHaveBeenCalledWith();
		});
	});
});

class Page {
	constructor(private fixture: ComponentFixture<CategoryEditDialogComponent>) {}

	get weightInput() {
		return this.fixture.nativeElement.querySelector('#weight');
	}
}
