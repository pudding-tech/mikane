import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'user-dialog',
	templateUrl: './user-dialog.component.html',
})
export class UserDialogComponent implements OnInit, OnDestroy {
	private subscription: Subscription;

	users: User[];
	newUser = { name: '' };

	addUserForm = new FormGroup({
		users: new FormControl(''),
	});

	constructor(public dialogRef: MatDialogRef<UserDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { users: Observable<User[]> }) {}

	ngOnInit(): void {
		this.data.users.subscribe((users) => {
			this.users = users;
		});
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

	ngOnDestroy(): void {
		this.subscription?.unsubscribe();
	}
}
