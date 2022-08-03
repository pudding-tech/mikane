import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable, first, combineLatest, map } from 'rxjs';
import { EventService } from 'src/app/services/event/event.service';
import { Expense } from 'src/app/services/expense/expense.service';
import { User, UserService } from 'src/app/services/user/user.service';
import { ExpenseDataSource } from './expense.datasource';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

type UsersWithBalance = {
    user: User,
    balances: {
        spending: number,
        expenses: number,
        balance: number,
    }
}
@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
	private eventId!: number;

	users: User[] = [];
    usersWithBalance: UsersWithBalance[] = [];

	displayedColumns: string[] = ['name', 'amount', 'category', 'description'];
    dataSource!: ExpenseDataSource;

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

        this.dataSource = new ExpenseDataSource(this.userService);
	}

	loadUsers() {
		if (this.eventId) {
            combineLatest([
                this.userService.loadUsers(this.eventId),
                this.userService.loadUserBalance(this.eventId)
            ]).pipe(map(([users, userBalances]) => {
                const usersWithBalance: UsersWithBalance[] = [];
                _.map(users, (user) => {
                    const userBalance = userBalances.filter((balance) => balance.userId === user.id)[0];
                    usersWithBalance.push({
                        user: user,
                        balances: {
                            spending: userBalance?.spending ?? 0,
                            expenses: userBalance?.expenses ?? 0,
                            balance: userBalance?.balance ?? 0
                        }
                    });
                });
                return usersWithBalance
            })).subscribe((usersWithBalance) => {
                this.usersWithBalance = usersWithBalance;
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

    getExpenses(user: User): void {
        this.dataSource.loadExpenses(user.id);
    }
}
