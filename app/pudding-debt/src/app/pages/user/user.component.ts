import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserService } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
	users: User[] = [];
    eventId: number;

	constructor(private userService: UserService, private router: Router) {
        this.eventId = this.router.getCurrentNavigation()?.extras.state?.['event'];
    }

	ngOnInit() {
        console.log('event', this.eventId);
        console.log('current navigation', this.router.getCurrentNavigation());
        if (this.eventId) {
            this.userService.loadUsersForEvent(this.eventId).subscribe((users) => {
                this.users = users;
            });
        } else {
            console.error('no even found in route data');
        }
	}
}
