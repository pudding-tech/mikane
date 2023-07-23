import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { ParticipantItemComponent } from 'src/app/features/mobile/participant-item/participant-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, PuddingEvent } from 'src/app/services/event/event.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User, UserBalance, UserService } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { ExpenditureDialogComponent } from '../expenditures/expenditure-dialog/expenditure-dialog.component';
import { ExpenseDataSource } from './expense.datasource';
import { ParticipantDialogComponent } from './user-dialog/participant-dialog.component';

@Component({
	selector: 'app-participant',
	templateUrl: './participant.component.html',
	styleUrls: ['./participant.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		MatProgressSpinnerModule,
		MatTableModule,
		ProgressSpinnerComponent,
		MatCardModule,
		CurrencyPipe,
		MatDialogModule,
		MatListModule,
		ParticipantItemComponent,
	],
})
export class ParticipantComponent implements OnInit, OnDestroy {
	private eventId!: string;
	private userSubscription: Subscription;
	private addUserSubscription: Subscription;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);
	cancel$: Subject<void> = new Subject();

	users: User[] = [];
	usersWithBalance: UserBalance[] = [];

	displayedColumns: string[] = ['name', 'amount', 'category', 'description', 'actions'];
	dataSources: ExpenseDataSource[] = [];

	inEvent = false;
	isAdmin = false;

	constructor(
		private userService: UserService,
		private eventService: EventService,
		private route: ActivatedRoute,
		public dialog: MatDialog,
		private messageService: MessageService,
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private authService: AuthService,
		public breakpointService: BreakpointService,
		public contextService: ContextService
	) {}

	ngOnInit() {
		this.route?.parent?.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadUsers();
		});
	}

	loadUsers() {
		if (this.eventId) {
			this.loading.next(true);
			this.userSubscription = combineLatest([this.eventService.loadBalances(this.eventId), this.authService.getCurrentUser()])
				.pipe(
					map(([usersWithBalance, currentUser]): UserBalance[] => {
						this.inEvent =
							usersWithBalance.filter((userWithBalance) => {
								return userWithBalance?.user?.id === currentUser?.id;
							}).length !== 0;
						this.isAdmin = usersWithBalance.find((userWithBalance) => {
							return userWithBalance?.user?.id === currentUser?.id;
						})?.user.eventInfo?.isAdmin;
						return usersWithBalance;
					})
				)
				.subscribe({
					next: (usersWithBalance) => {
						this.usersWithBalance = usersWithBalance;
						this.loading.next(false);
						for (let i = 0; i < usersWithBalance.length; i++) {
							this.dataSources.push(new ExpenseDataSource(this.userService));
						}
					},
					error: () => {
						this.messageService.showError('Error loading users and user balance');
						this.loading.next(false);
					},
				});
		} else {
			console.error('NO EVENT ID');
		}
	}

	joinEvent() {
		if (this.eventId) {
			this.addUserSubscription = this.authService
				.getCurrentUser()
				.pipe(
					switchMap((currentUser) => {
						return this.eventService.addUser(this.eventId, currentUser.id);
					})
				)
				.subscribe({
					next: (event) => {
						if (event) {
							this.messageService.showSuccess('Joined event successfully');

							// Reload users and balances
							this.loadUsers();
						} else {
							this.messageService.showError('Something went wrong adding user to event');
							console.error('Something went wrong adding user to event');
						}
					},
					error: (err: ApiError) => {
						this.messageService.showError('Error adding user to event');
						console.error(err?.error?.message);
					},
				});
		}
	}

	openDialog() {
		const dialogRef = this.dialog.open(ParticipantDialogComponent, {
			width: '350px',
			data: {
				users: this.userService.loadUsers().pipe(
					map((users) => {
						const participants = this.usersWithBalance.map((user) => user.user.id);
						return users.filter((user) => {
							return !participants.includes(user.id);
						});
					})
				),
			},
			autoFocus: false,
		});

		dialogRef
			.afterClosed()
			.pipe(
				switchMap((data: { users: User[] }): Observable<PuddingEvent[]> => {
					if (data?.users) {
						return forkJoin([
							...data.users.map((user) => {
								return this.eventService.addUser(this.eventId, user.id);
							}),
						]);
					} else {
						return of([]);
					}
				})
			)
			.subscribe({
				next: (events: PuddingEvent[]) => {
					if (events?.length > 0) {
						// Reload users and balances
						this.loadUsers();
						this.messageService.showSuccess('Users added to event');
					}
				},
				error: (err: ApiError) => {
					// Reload users and balances in case of partial success
					this.loadUsers();
					this.messageService.showError('Failed to add users to event');
					console.error('something went wrong while adding users to event: ' + err?.error?.message);
				},
			});
	}

	createUser(user: { name: string }) {
		this.userService.createUser(this.eventId, user.name).subscribe({
			next: () => {
				// Reload users and balances
				this.loadUsers();
				this.messageService.showSuccess('User created!');
			},
			error: () => {
				this.messageService.showError('Failed to create user');
			},
		});
	}

	deleteUserDialog(userId: string) {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '380px',
			data: {
				title: 'Remove User',
				content: 'Are you sure you want to remove this user? All of their expenses will be permanently deleted!',
				confirm: 'I am sure',
			},
		});

		dialogRef.afterClosed().subscribe((confirm) => {
			if (confirm) {
				this.removeUser(userId);
			}
		});
	}

	removeUser(userId: string) {
		this.eventService.removeUser(this.eventId, userId).subscribe({
			next: () => {
				// Reload users and balances
				this.loadUsers();
				this.messageService.showSuccess('User removed!');
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to remove user');
				console.error(err.error.message);
			},
		});
	}

	getExpenses(user: User, index: number): void {
		this.dataSources[index].loadExpenses(user.id, this.eventId);
	}

	createExpenseDialog(userId: string, dataSource: ExpenseDataSource) {
		const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
			width: '400px',
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
					return this.categoryService.findOrCreate(this.eventId, expense?.category);
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

	deleteExpense(id: string, dataSource: ExpenseDataSource): void {
		this.expenseService.deleteExpense(id).subscribe({
			next: () => {
				dataSource.removeExpense(id);
				this.messageService.showSuccess('Expense deleted!');
			},
			error: () => {
				this.messageService.showError('Failed to delete expense from user');
			},
		});
	}

	ngOnDestroy(): void {
		this.userSubscription?.unsubscribe();
		this.addUserSubscription?.unsubscribe();
		this.dataSources.forEach((dataSource) => dataSource.destroy());
	}
}
