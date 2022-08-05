import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
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

    loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	users: User[] = [];
    usersWithBalance: UsersWithBalance[] = [];

	displayedColumns: string[] = ['name', 'amount', 'category', 'description', 'actions'];
    dataSource!: ExpenseDataSource;

	constructor(
		private userService: UserService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
        private messageService: MessageService,
        private expenseService: ExpenseService,
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
            this.loading.next(true);
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
            })).subscribe({next: (usersWithBalance) => {
                this.usersWithBalance = usersWithBalance;
                this.loading.next(false);
            }, error: () => {
                this.messageService.showError('Error loading users and user balance');
                this.loading.next(false);
            }});
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
        this.userService.createUser(this.eventId, user.name).subscribe({next: (user) => {
            this.loadUsers();
            this.messageService.showSuccess('User created!');
        }, error: () => {
            this.messageService.showError('Failed to create user');
        }});
    }

    getExpenses(user: User): void {
        this.dataSource.loadExpenses(user.id);
    }

    deleteExpense(id: number, dataSource: ExpenseDataSource): void {
        this.expenseService.deleteExpense(id).subscribe({next: () => {
            dataSource.removeExpense(id);
            this.messageService.showSuccess('Expense deleted!');
        }, error: () => {
            this.messageService.showError('Failed to delete expense from user');
        }});
    }
}
