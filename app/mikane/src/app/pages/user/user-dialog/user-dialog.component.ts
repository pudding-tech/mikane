import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { User } from 'src/app/services/user/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
	selector: 'user-dialog',
	templateUrl: './user-dialog.component.html',
	styleUrls: ['./user-dialog.component.scss'],
	standalone: true,
	imports: [
		MatDialogModule,
		FormsModule,
		ReactiveFormsModule,
		MatFormFieldModule,
		MatSelectModule,
		NgFor,
		MatOptionModule,
		MatButtonModule,
	],
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
