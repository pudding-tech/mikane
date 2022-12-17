import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import {
	BehaviorSubject,
	Subject,
	switchMap,
	takeUntil,
} from 'rxjs';
import {
	Category,
	CategoryService,
} from 'src/app/services/category/category.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import {
	User,
	UserBalance,
	UserService,
} from 'src/app/services/user/user.service';
import { ExpenditureDialogComponent } from '../expenditures/expenditure-dialog/expenditure-dialog.component';
import { DeleteUserDialogComponent } from './delete-user-dialog/delete-user-dialog.component';
import { ExpenseDataSource } from './expense.datasource';
import { UserDialogComponent } from './user-dialog/user-dialog.component';

@Component({
	selector: 'app-users',
	templateUrl: './user.component.html',
	styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
	private eventId!: number;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	cancel$: Subject<void> = new Subject();

	users: User[] = [];
	usersWithBalance: UserBalance[] = [];

	displayedColumns: string[] = [
		'name',
		'amount',
		'category',
		'description',
		'actions',
	];
	dataSource!: ExpenseDataSource;

	constructor(
		private userService: UserService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private messageService: MessageService,
		private expenseService: ExpenseService,
		private categoryService: CategoryService
	) {}

	ngOnInit() {
		this.route.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadUsers();
		});

		this.dataSource = new ExpenseDataSource(this.userService);
	}

	loadUsers() {
		if (this.eventId) {
			this.loading.next(true);
			this.userService.loadUserBalance(this.eventId).subscribe({
				next: (usersWithBalance) => {
					this.usersWithBalance = usersWithBalance;
					this.loading.next(false);
				},
				error: () => {
					this.messageService.showError(
						'Error loading users and user balance'
					);
					this.loading.next(false);
				},
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

	createUser(user: { name: string }) {
		this.userService.createUser(this.eventId, user.name).subscribe({
			next: (user) => {
				this.loadUsers();
				this.messageService.showSuccess('User created!');
			},
			error: () => {
				this.messageService.showError('Failed to create user');
			},
		});
	}

	deleteUserDialog(userId: number) {
		const dialogRef = this.dialog.open(DeleteUserDialogComponent, {
			width: '350px',
			data: userId,
		});

		dialogRef.afterClosed().subscribe((userId) => {
			if (userId) {
				this.deleteUser(userId);
			}
		});
	}

	deleteUser(userId: number) {
		this.userService.deleteUser(userId).subscribe({
			next: () => {
				this.loadUsers();
				this.messageService.showSuccess('User deleted!');
			},
			error: () => {
				this.messageService.showError('Failed to delete user');
			},
		});
	}

	getExpenses(user: User): void {
		this.dataSource.loadExpenses(user.id, this.eventId);
	}

	createExpenseDialog(userId: number, dataSource: ExpenseDataSource) {
		const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
			width: '350px',
			data: {
				eventId: this.eventId,
				userId,
			},
		});

		let newExpense: any;
		dialogRef
			.afterClosed()
			.pipe(
				switchMap((expense) => {
					if (!expense) {
						this.cancel$.next();
					}
					newExpense = expense;
					return this.categoryService.findOrCreate(
						this.eventId,
						expense?.category
					);
				}),
				takeUntil(this.cancel$)
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.createExpense(
						newExpense.name,
						newExpense.description,
						newExpense.amount,
						category.id,
						newExpense.payer
					);
				})
			)
			.subscribe({
				next: (expense) => {
					dataSource.addExpense(expense);
					this.messageService.showSuccess('New expense created!');
				},
				error: () => {
					this.messageService.showError('Failed to create expense');
				},
			});
	}

	deleteExpense(id: number, dataSource: ExpenseDataSource): void {
		this.expenseService.deleteExpense(id).subscribe({
			next: () => {
				dataSource.removeExpense(id);
				this.messageService.showSuccess('Expense deleted!');
			},
			error: () => {
				this.messageService.showError(
					'Failed to delete expense from user'
				);
			},
		});
	}
}
