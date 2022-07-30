import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserService } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
    private eventId!: number;

	users: User[] = [];

	constructor(private userService: UserService, private route: ActivatedRoute) {
    }

	ngOnInit() {
        this.route.parent?.params.subscribe(params => {
            console.log('route params', params);
            this.eventId = params['eventId'];
            this.loadUsers();
        });
	}
    
    loadUsers() {
        if (this.eventId) {
            this.userService.loadUsersForEvent(this.eventId).subscribe((users) => {
                this.users = users;
            });
        } else {
            console.error('NO EVENT ID');
        }
    }
}
