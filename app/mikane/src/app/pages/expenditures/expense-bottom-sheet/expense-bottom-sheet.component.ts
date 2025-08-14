import { NgOptimizedImage } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { User } from 'src/app/services/user/user.service';

interface CategoryInfo {
	id: string;
	name: string;
	icon: string;
}

@Component({
	selector: 'app-expense-bottom-sheet',
	templateUrl: './expense-bottom-sheet.component.html',
	styleUrls: ['./expense-bottom-sheet.component.scss'],
	imports: [MatListModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, MatInputModule, NgOptimizedImage],
})
export class ExpenseBottomSheetComponent {
	data = inject<{ type: 'search' | 'payers' | 'categories'; filterData?: User[] | CategoryInfo[]; currentFilter: string[] }>(
		MAT_BOTTOM_SHEET_DATA,
	);

	@Output() inputDataChange = new EventEmitter<string[]>();
	protected selectedValues: string[];
	protected searchValue = '';
	protected payers: User[];
	protected categories: CategoryInfo[];

	constructor() {
		const data = this.data;

		this.selectedValues = data.currentFilter ?? [];
		if (data.type === 'search') {
			this.searchValue = data.currentFilter[0];
		} else if (data.type === 'payers') {
			this.payers = (data.filterData ?? []) as User[];
		} else if (data.type === 'categories') {
			this.categories = (data.filterData ?? []) as CategoryInfo[];
		}
	}

	selectItem(value: string): void {
		const indexToRemove = this.selectedValues.indexOf(value);
		if (indexToRemove !== -1) {
			this.selectedValues.splice(indexToRemove, 1);
		} else {
			this.selectedValues.push(value);
		}
		this.inputDataChange.emit(this.selectedValues);
	}

	applySearchFilter() {
		this.inputDataChange.emit([this.searchValue]);
	}

	clearInput() {
		this.searchValue = '';
		this.inputDataChange.emit([this.searchValue]);
	}
}
