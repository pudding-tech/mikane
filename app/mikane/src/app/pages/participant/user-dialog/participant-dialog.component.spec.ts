import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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

import { ParticipantDialogComponent } from './participant-dialog.component';

describe('ParticipantDialogComponent', () => {
	let component: ParticipantDialogComponent;
	let fixture: ComponentFixture<ParticipantDialogComponent>;
	let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ParticipantDialogComponent>>;
	let data: { users: Observable<User[]> };
	let users: User[];

	beforeEach(async () => {
		dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
		users = [
			{ id: '1', name: 'User 1' },
			{ id: '2', name: 'User 2' },
			{ id: '3', name: 'User 3' },
		] as User[];
		data = { users: of(users) };
		await TestBed.configureTestingModule({
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
				{ provide: MatDialogRef, useValue: dialogRefSpy },
				{ provide: MAT_DIALOG_DATA, useValue: data },
			],
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ParticipantDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize the filtered users', () => {
		expect(component.filteredUsers).toBeTruthy();
		component.filteredUsers.subscribe((result) => {
			expect(result).toEqual(users);
		});
	});

	xit('should filter the users by name', () => {
		component.addUserForm.get('users').setValue('user 1');
		component.filteredUsers.subscribe((result) => {
			console.log('result', result);
			expect(result).toEqual([users[0]]);
		});
	});

	it('should add a user to the selected users', () => {
		const user = users[0];
		component.addUserForm.get('users').setValue(user);
		component.add({
			value: user as unknown,
			chipInput: {
				clear: () => {},
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
		component.selected({ option: { value: user } } as any);
		expect(component.selectedUsers).toEqual([user]);
	});

	it('should display the user name', () => {
		const user = users[0];
		expect(component.displayFn(user)).toEqual(user.name);
	});

	it('should close the dialog', () => {
		component.onNoClick();
		expect(dialogRefSpy.close).toHaveBeenCalled();
	});
});
