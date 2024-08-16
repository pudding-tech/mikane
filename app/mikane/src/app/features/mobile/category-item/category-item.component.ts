import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, input, output, Renderer2, ViewChild, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { Category } from 'src/app/services/category/category.service';
import { User } from 'src/app/services/user/user.service';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { CategoryIcon } from 'src/app/types/enums';

@Component({
	selector: 'app-category-item',
	templateUrl: 'category-item.component.html',
	styleUrls: ['./category-item.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		CurrencyPipe,
		MatListModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		FormControlPipe,
		FormsModule,
		ReactiveFormsModule,
	],
})
export class CategoryItemComponent {
	private renderer = inject(Renderer2);

	@ViewChild('lower') lower: ElementRef;
	category = input.required<Category>();
	eventActive = input.required<boolean>();
	addUserForm = input.required<FormGroup>();
	filterUsers = input.required<(categoryId: string) => User[]>();
	addUser = output<{ categoryId: string }>();
	removeUser = output<{ categoryId: string; userId: string }>();
	openEditCategoryDialog = output<{ categoryId: string; name: string; icon: CategoryIcon }>();
	openWeightEditDialog = output<{ categoryId: string; userId: string; weight: number }>();
	toggleWeighted = output<{ categoryId: string; weighted: boolean }>();
	deleteCategoryDialog = output<{ categoryId: string }>();
	gotoCategoryExpenses = output<{ category: Category }>();
	gotoUser = output<{ user: { id: string, guest: boolean, username: string } }>();

	dropdownOpen = false;
	lowerHeight = 0;

	toggleDropdown = () => {
		this.dropdownOpen = !this.dropdownOpen;

		if (this.lowerHeight === 0) {
			this.lowerHeight = this.lower.nativeElement.scrollHeight;
		} else {
			this.lowerHeight = 0;
		}
	};

	addUserToCategory = (categoryId: string) => {
		this.addUser.emit({ categoryId });
		setTimeout(() => {
			this.lowerHeight = this.lower.nativeElement.scrollHeight;
		}, 100);
	};

	removeUserFromCategory = (categoryId: string, userId: string) => {
		this.removeUser.emit({ categoryId, userId });
		this.renderer.setStyle(this.lower.nativeElement, 'height', 'auto');
	};

	openEditWeight = (categoryId: string, userId: string, weight: number) => {
		this.openWeightEditDialog.emit({ categoryId, userId, weight });
	};

	openEdit = (categoryId: string, name: string, icon: CategoryIcon) => {
		this.openEditCategoryDialog.emit({ categoryId, name, icon });
	};

	toggleWeightedCategory = (categoryId: string, weighted: boolean) => {
		this.toggleWeighted.emit({ categoryId, weighted });
	};

	deleteCategory = (categoryId: string) => {
		this.deleteCategoryDialog.emit({ categoryId });
	};

	gotoExpenses = () => {
		this.gotoCategoryExpenses.emit({ category: this.category() });
	};

	gotoUserProfile = (user: { id: string, guest: boolean, username: string }) => {
		this.gotoUser.emit({ user: user });
	};
}
