import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { EMPTY, Subscription, switchMap } from 'rxjs';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { ApiError } from 'src/app/types/apiError.type';
import { GuestDialogComponent } from './guest-dialog/guest-dialog.component';

@Component({
	templateUrl: './guests.component.html',
	styleUrls: ['./guests.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		MatFormFieldModule,
		MatCardModule,
		MatListModule,
		MenuComponent,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatInputModule,
		MatDialogModule,
		MatPaginatorModule,
		RouterModule,
		ProgressSpinnerComponent,
	],
})
export class GuestsComponent implements OnInit, OnDestroy {
	loading = false;
	guests: User[] = [];
	pagedGuests: User[] = [];

	private guestsSubscription: Subscription;
	private editSubscription: Subscription;

	// Paginator
	length = 0;
	pageSize = 20;
	pageSizeOptions: number[] = [10, 20, 30];

	constructor(
		private userService: UserService,
		private messageService: MessageService,
		protected breakpointService: BreakpointService,
		public dialog: MatDialog
	) {}

	ngOnInit() {
		this.loadUsers();
	}

	loadUsers() {
		this.loading = true;
		this.guestsSubscription = this.userService.loadGuestUsers().subscribe({
			next: (guests) => {
				this.guests = guests;
				this.pagedGuests = guests.slice(0, this.pageSize);
				this.length = guests.length;
				this.loading = false;
			},
			error: (err: ApiError) => {
				this.loading = false;
				this.messageService.showError('Failed to load guest users');
				console.error('Something went wrong while loading guest users', err);
			},
		});
	}

	newGuest() {
		const dialogRef = this.dialog.open(GuestDialogComponent, {
			width: '350px',
		});

		dialogRef
			.afterClosed()
			.pipe(
				switchMap((res: { guest: { firstName: string; lastName: string } }) => {
					if (res?.guest) {
						return this.userService.createGuestUser(res.guest.firstName, res.guest.lastName);
					}
					return EMPTY;
				})
			)
			.subscribe({
				next: () => {
					this.loadUsers();
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to create guest');
					console.error('Something went wrong while creating guest', err?.error?.message);
				},
			});
	}

	editGuest(guest: User) {
		const dialogRef = this.dialog.open(GuestDialogComponent, {
			width: '400px',
			data: {
				edit: true,
				guest,
			},
			autoFocus: false,
		});

		this.editSubscription = dialogRef
			.afterClosed()
			.pipe(
				switchMap((res: { guest: { id: string; firstName: string; lastName: string }; delete: boolean }) => {
					if (res?.guest) {
						if (res?.delete) {
							return this.userService.deleteGuestUser(guest.id);
						}
						return this.userService.editGuestUser(res.guest.id, res.guest.firstName, res.guest.lastName);
					}
					return EMPTY;
				})
			)
			.subscribe({
				next: () => {
					this.loadUsers();
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to edit guest');
					console.error('Something went wrong while editing guest', err?.error?.message);
				},
			});
	}

	onPageChange(pageEvent: PageEvent) {
		const startIndex = pageEvent.pageIndex * pageEvent.pageSize;
		let endIndex = startIndex + pageEvent.pageSize;
		if (endIndex > this.length) {
			endIndex = this.length;
		}
		this.pagedGuests = this.guests.slice(startIndex, endIndex);
		this.pageSize = pageEvent.pageSize;
	}

	ngOnDestroy(): void {
		this.guestsSubscription?.unsubscribe();
		this.editSubscription?.unsubscribe();
	}
}
