import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
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
	@ViewChild('lower') lower: ElementRef;
	@Input() eventActive: boolean;
	@Input() category: Category;
	@Input() addUserForm: FormGroup;
	@Input() filterUsers: (categoryId: string) => User[];
	@Output() addUser = new EventEmitter<{ categoryId: string }>();
	@Output() removeUser = new EventEmitter<{ categoryId: string; userId: string }>();
	@Output() openEditCategoryDialog = new EventEmitter<{ categoryId: string; name: string; icon: CategoryIcon }>();
	@Output() openWeightEditDialog = new EventEmitter<{ categoryId: string; userId: string; weight: number }>();
	@Output() toggleWeighted = new EventEmitter<{ categoryId: string; weighted: boolean }>();
	@Output() deleteCategoryDialog = new EventEmitter<{ categoryId: string }>();
	@Output() gotoCategoryExpenses = new EventEmitter<{ category: Category }>();

	dropdownOpen = false;
	lowerHeight = 0;

	constructor(private renderer: Renderer2) {}

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
		this.gotoCategoryExpenses.emit({ category: this.category });
	}
}
