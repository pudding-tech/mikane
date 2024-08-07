import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { User } from 'src/app/services/user/user.service';

type CategoryInfo = {
	id: string;
	name: string;
	icon: string;
};

@Component({
	selector: 'app-expense-bottom-sheet',
	templateUrl: './expense-bottom-sheet.component.html',
	styleUrls: ['./expense-bottom-sheet.component.scss'],
	standalone: true,
	imports: [MatListModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, MatInputModule],
})
export class ExpenseBottomSheetComponent {
	@Output() inputDataChange = new EventEmitter<string[]>();
	protected selectedValues: string[];
	protected searchValue = '';
	protected payers: User[];
	protected categories: CategoryInfo[];

	constructor(
		@Inject(MAT_BOTTOM_SHEET_DATA)
		public data: { type: 'search' | 'payers' | 'categories'; filterData?: User[] | CategoryInfo[]; currentFilter: string[] },
	) {
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
