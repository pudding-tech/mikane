import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormControlPipe } from 'src/app/shared/forms/form-control.pipe';
import { Category } from 'src/app/services/category/category.service';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'category-item',
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
	@Input('category') category: Category;
	@Input() addUserForm: FormGroup;
	@Input() filterUsers: (categoryId: string) => User[];
	@Output() addUser = new EventEmitter<{ categoryId: string }>();
	@Output() removeUser = new EventEmitter<{ categoryId: string, userId: string }>();
	@Output() openEditDialog = new EventEmitter<{ categoryId: string, userId: string, weight: number }>();
	@Output() toggleWeighted = new EventEmitter<{ categoryId: string, weighted: boolean }>();
	@Output() deleteCategoryDialog = new EventEmitter<{ categoryId: string }>();

	dropdownOpen: boolean = false;
	lowerHeight: number = 0;

	constructor(private renderer: Renderer2) {}

	toggleDropdown = () => {
		this.dropdownOpen = !this.dropdownOpen;

		if (this.lowerHeight === 0) {
			this.lowerHeight = this.lower.nativeElement.scrollHeight;	
		}
		else {
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

	openEdit = (categoryId: string, userId: string, weight: number) => {
		this.openEditDialog.emit({ categoryId, userId, weight });
	};

	toggleWeightedCategory = (categoryId: string, weighted: boolean) => {
		this.toggleWeighted.emit({ categoryId, weighted });
	};

	deleteCategory = (categoryId: string) => {
		this.deleteCategoryDialog.emit({ categoryId });
	};
}
