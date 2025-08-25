import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of } from 'rxjs';
import { User } from 'src/app/services/user/user.service';
import { vi } from 'vitest';
import { ParticipantDialogComponent } from './participant-dialog.component';

describe('ParticipantDialogComponent', () => {
	let component: ParticipantDialogComponent;
	let fixture: ComponentFixture<ParticipantDialogComponent>;
	let dialogRefSpy: MatDialogRef<ParticipantDialogComponent>;
	let data: { users: Observable<User[]> };
	let users: User[];

	beforeEach(() => {
		users = [
			{ id: '1', name: 'User 1' },
			{ id: '2', name: 'User 2' },
			{ id: '3', name: 'User 3' },
		] as User[];
		data = { users: of(users) };

		TestBed.configureTestingModule({
			imports: [
				ParticipantDialogComponent,
				BrowserAnimationsModule,
				ReactiveFormsModule,
				MatFormFieldModule,
				MatSelectModule,
				MatOptionModule,
				MatChipsModule,
				MatIconModule,
				MatInputModule,
				MatAutocompleteModule,
			],
			providers: [
				{
					provide: MatDialogRef,
					useValue: {
						close: vi.fn(),
					},
				},
				{ provide: MAT_DIALOG_DATA, useValue: data },
			],
		});

		fixture = TestBed.createComponent(ParticipantDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should initialize the filtered users', () => {
		expect(component.filteredUsers).toBeDefined();
		component.filteredUsers.subscribe((filtered) => {
			expect(filtered).toEqual(users);
		});
	});

	it('should add a user to the selected users', () => {
		const user = users[0];
		component.addUserForm.get('users').setValue(user);
		component.add({
			value: user as unknown,
			chipInput: {
				clear: () => {
					return;
				},
			},
		} as MatChipInputEvent);

		expect(component.selectedUsers).toEqual([user]);
	});

	it('should remove a user from the selected users', () => {
		const user = users[0];
		component.selectedUsers = [user];
		component.remove(user);

		expect(component.selectedUsers).toEqual([]);
	});

	it('should select a user from the autocomplete', () => {
		const user = users[0];
		component.selected({ option: { value: user } } as MatAutocompleteSelectedEvent);

		expect(component.selectedUsers).toEqual([user]);
	});

	it('should display the user name', () => {
		const user = users[0];

		expect(component.displayFn(user)).toEqual(user.name);
	});

	it('should close the dialog', () => {
		dialogRefSpy = TestBed.inject(MatDialogRef);
		component.onNoClick();

		expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
	});
});
