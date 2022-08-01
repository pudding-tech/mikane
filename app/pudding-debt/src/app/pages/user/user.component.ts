import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from 'src/app/services/event/event.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
	private eventId!: number;

	users: User[] = [];

	constructor(
		private userService: UserService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
        private eventService: EventService,
	) {}

	ngOnInit() {
		this.route.parent?.params.subscribe((params) => {
			console.log('route params', params);
			this.eventId = params['eventId'];
			this.loadUsers();
		});
	}

	loadUsers() {
		if (this.eventId) {
			this.userService
				.loadUsersForEvent(this.eventId)
				.subscribe((users) => {
					this.users = users;
				});
		} else {
			console.error('NO EVENT ID');
		}
	}

    openDialog() {
        const dialogRef = this.dialog.open(UserDialogComponent, {
            width: '350px',
        });
        
        dialogRef.afterClosed().subscribe((user) => {
            if (user) {
                this.createUser(user);
            }
        });
    }

    createUser(user: {name: string}) {
        this.userService.createUser(this.eventId, user.name).subscribe((user) => {
            this.users.push(user);
        });
    }
}
