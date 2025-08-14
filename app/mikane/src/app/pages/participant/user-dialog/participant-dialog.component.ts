import { ENTER } from '@angular/cdk/keycodes';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { User } from 'src/app/services/user/user.service';

@Component({
	templateUrl: './participant-dialog.component.html',
	styleUrls: ['./participant-dialog.component.scss'],
	imports: [
		MatDialogModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatSelectModule,
		MatOptionModule,
		MatButtonModule,
		MatAutocompleteModule,
		MatInputModule,
		AsyncPipe,
		MatChipsModule,
		MatIconModule,
		NgOptimizedImage,
	],
})
export class ParticipantDialogComponent implements OnInit {
	dialogRef = inject<MatDialogRef<ParticipantDialogComponent>>(MatDialogRef);
	data = inject<{ users: Observable<User[]> }>(MAT_DIALOG_DATA);

	private users: User[] = [];

	@ViewChild('userInput') userInput: ElementRef<HTMLInputElement>;
	@ViewChild(MatAutocompleteTrigger) autoTrigger: MatAutocompleteTrigger;

	readonly separatorKeysCodes = [ENTER] as const;

	filteredUsers: Observable<User[]>;
	selectedUsers: User[] = [];

	addUserForm = new FormGroup({
		users: new FormControl<string | User>(''),
	});

	ngOnInit(): void {
		this.filteredUsers = this.data.users.pipe(
			switchMap((users) => {
				this.users = users;
				return this.addUserForm.get('users').valueChanges.pipe(
					startWith(''),
					map((addUser) => {
						const name = typeof addUser === 'string' ? addUser : addUser?.name;
						return name ? this._filter(name as string) : this.users.filter((user) => !this.selectedUsers.includes(user));
					}),
				);
			}),
		);
	}

	private _filter(name: string): User[] {
		return this.users.filter((user) => {
			return user.name.toLowerCase().includes(name.toLowerCase());
		});
	}

	add(event: MatChipInputEvent) {
		if (event?.value) {
			this.selectedUsers.push(event.value as unknown as User);
		}

		event.chipInput.clear();
		this.addUserForm.get('users').setValue(null);
	}

	remove(user: User): void {
		const index = this.selectedUsers.indexOf(user);

		if (index >= 0) {
			this.selectedUsers.splice(index, 1);
		}
		this.addUserForm.get('users').setValue(null);
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		this.selectedUsers.push(event.option.value as User);
		this.userInput.nativeElement.value = '';
		this.addUserForm.get('users').setValue(null);
	}

	displayFn(user: User): string {
		return user && user.name ? user.name : '';
	}

	onNoClick(): void {
		this.dialogRef.close();
	}
}
