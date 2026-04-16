import { CommonModule, CurrencyPipe, NgOptimizedImage } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import {
	BehaviorSubject,
	NEVER,
	Observable,
	Subject,
	Subscription,
	combineLatest,
	distinctUntilChanged,
	filter,
	forkJoin,
	map,
	of,
	switchMap,
	takeUntil,
} from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { ParticipantItemComponent } from 'src/app/features/mobile/participant-item/participant-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { EventService, EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { ExpenseService } from 'src/app/services/expense/expense.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ScrollService } from 'src/app/services/scroll/scroll.service';
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
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		MatProgressSpinnerModule,
		MatTableModule,
		MatTooltipModule,
		ProgressSpinnerComponent,
		MatCardModule,
		CurrencyPipe,
		MatDialogModule,
		MatListModule,
		ParticipantItemComponent,
		MatSortModule,
		NgOptimizedImage,
	],
})
export class ParticipantComponent implements OnInit, OnDestroy {
	private userService = inject(UserService);
	private eventService = inject(EventService);
	private router = inject(Router);
	dialog = inject(MatDialog);
	private messageService = inject(MessageService);
	private expenseService = inject(ExpenseService);
	private categoryService = inject(CategoryService);
	protected authService = inject(AuthService);
	breakpointService = inject(BreakpointService);
	contextService = inject(ContextService);
	scrollService = inject(ScrollService);
	private logService = inject(LogService);

	@Input() $event: BehaviorSubject<PuddingEvent>;
	private userSubscription: Subscription;
	private addUserSubscription: Subscription;
	private eventSubscription: Subscription;
	readonly EventStatusType = EventStatusType;

	loading = new BehaviorSubject<boolean>(false);
	cancel$ = new Subject<void>();

	event: PuddingEvent;
	currentUser: User;
	usersWithBalance: UserBalance[] = [];
	usersWithBalance$ = new BehaviorSubject<UserBalance[]>([]);

	displayedParticipantColumns = ['icon', 'name', 'expensesCount', 'costs', 'expenses', 'balance'];
	displayedColumns: string[] = ['name', 'amount', 'category', 'description', 'expenseDate'];
	dataSources: ExpenseDataSource[] = [];

	inEvent = false;
	isAdmin = false;

	@ViewChild(MatAccordion) accordion: MatAccordion;

	ngOnInit() {
		this.eventSubscription = this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				distinctUntilChanged((a, b) => a?.id === b?.id),
				switchMap((event) => {
					if (event.id) {
						return of(event);
					} else {
						return of(undefined);
					}
				}),
			)
			.subscribe({
				next: (event) => {
					if (event.status.id === EventStatusType.ACTIVE && !this.displayedColumns.find((col) => col === 'actions')) {
						this.displayedColumns.push('actions');
					}
					this.event = event;
					this.loadUsers();
				},
			});
	}

	loadUsers() {
		this.loading.next(true);
		this.userSubscription = combineLatest([this.eventService.loadBalances(this.event.id), this.authService.getCurrentUser()])
			.pipe(
				map(([usersWithBalance, currentUser]): UserBalance[] => {
					this.currentUser = currentUser;
					this.inEvent =
						usersWithBalance.filter((userWithBalance) => {
							return userWithBalance?.user?.id === currentUser?.id;
						}).length !== 0;
					this.isAdmin = usersWithBalance.find((userWithBalance) => {
						return userWithBalance?.user?.id === currentUser?.id;
					})?.user.eventInfo?.isAdmin;
					return usersWithBalance;
				}),
			)
			.subscribe({
				next: (usersWithBalance) => {
					this.usersWithBalance = usersWithBalance;
					this.usersWithBalance$.next(usersWithBalance);
					this.loading.next(false);
					usersWithBalance.forEach(() => {
						this.dataSources.push(new ExpenseDataSource(this.userService));
					});
				},
				error: () => {
					this.messageService.showError('Error loading users and user balance');
					this.loading.next(false);
				},
			});
	}

	joinEvent() {
		if (this.event.id) {
			this.addUserSubscription = this.authService
				.getCurrentUser()
				.pipe(
					switchMap((currentUser) => {
						return this.eventService.addUser(this.event.id, currentUser.id);
					}),
				)
				.subscribe({
					next: (event) => {
						if (event) {
							this.messageService.showSuccess('Joined event successfully');

							// Reload users and balances
							this.loadUsers();
						} else {
							this.messageService.showError('Something went wrong adding user to event');
							this.logService.error('Something went wrong adding user to event');
						}
					},
					error: (err: ApiError) => {
						this.messageService.showError('Error adding user to event');
						this.logService.error('Error adding user to event: ' + err?.error?.message);
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
					}),
				),
			},
		});

		dialogRef
			.afterClosed()
			.pipe(
				switchMap((users: User[]): Observable<PuddingEvent[]> => {
					if (users?.length > 0) {
						return forkJoin([
							...users.map((user) => {
								return this.eventService.addUser(this.event.id, user.id);
							}),
						]);
					} else {
						return of([]);
					}
				}),
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
					this.logService.error('Something went wrong while adding users to event: ' + err?.error?.message);
				},
			});
	}

	createUser(user: { name: string }) {
		this.userService.createUser(this.event.id, user.name).subscribe({
			next: () => {
				// Reload users and balances
				this.loadUsers();
				this.messageService.showSuccess('User created');
			},
			error: () => {
				this.messageService.showError('Failed to create user');
			},
		});
	}

	deleteUserDialog(user: User) {
		const privateInfo = `Please note: This is a private event.
			${
				user.id === this.currentUser.id
					? 'If you leave, you will not be able to rejoin on your own.'
					: 'If you remove this user, they will lose all access to the event.'
			}`;
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '430px',
			data: {
				title: user.id === this.currentUser.id ? `Leave ${this.event.name}` : `Remove ${user.name} from ${this.event.name}`,
				content: `Are you sure you want to ${user.id === this.currentUser.id ? 'leave this event?' : 'remove this user?'}`,
				extraContent: this.event.private ? privateInfo : undefined,
				confirm: 'I am sure',
			},
		});

		dialogRef.afterClosed().subscribe((confirm) => {
			if (confirm) {
				this.removeUser(user.id);
			}
		});
	}

	removeUser(userId: string) {
		this.eventService.removeUser(this.event.id, userId).subscribe({
			next: () => {
				if (this.event.private && userId === this.currentUser.id) {
					this.router.navigate(['events']);
					this.messageService.showSuccess(`You no longer have access to ${this.event.name}`);
				} else {
					// Reload users and balances
					this.loadUsers();
					this.messageService.showSuccess(userId === this.currentUser.id ? 'You have left the event' : 'User removed!');
				}
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to remove user');
				this.logService.error('Error removing user: ' + err?.error?.message);
			},
		});
	}

	getExpenses(user: User, index: number): void {
		this.dataSources[index].loadExpenses(user.id, this.event.id);
	}

	createExpenseDialog(userId: string, dataSource: ExpenseDataSource) {
		const expandedUserId = userId;
		const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
			width: '400px',
			data: {
				eventId: this.event.id,
				userId,
			},
		});

		let newExpense: {
			name: string;
			description: string;
			amount: number;
			payerId: string;
			expenseDate: Date;
		};
		dialogRef
			.afterClosed()
			.pipe(
				switchMap((expense) => {
					if (!expense) {
						this.cancel$.next();
						return NEVER;
					}
					newExpense = expense;
					return this.categoryService.findOrCreate(this.event?.id, expense?.category);
				}),
				takeUntil(this.cancel$),
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.createExpense(
						newExpense?.name,
						newExpense?.description,
						newExpense?.amount,
						category?.id,
						newExpense?.payerId,
						newExpense?.expenseDate,
					);
				}),
			)
			.subscribe({
				next: (expense) => {
					if (expense?.payer?.id === expandedUserId) {
						dataSource.addExpense(expense);
					}
					this.messageService.showSuccess('Expense created');
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
				this.messageService.showSuccess('Expense deleted');
			},
			error: () => {
				this.messageService.showError('Failed to delete expense from user');
			},
		});
	}

	sortData(sort: Sort) {
		// Close all open expansion panels
		this.accordion.closeAll();

		if (!sort.active || sort.direction === '') {
			this.usersWithBalance = [
				...this.usersWithBalance.sort((a, b) => {
					return this.compare(a.user.name, b.user.name, true);
				}),
			];
			this.usersWithBalance$.next(this.usersWithBalance);
			return;
		}

		this.usersWithBalance = [
			...this.usersWithBalance.sort((a, b) => {
				const isAsc = sort.direction === 'asc';
				switch (sort.active) {
					case 'name':
						return this.compare(a.user.name, b.user.name, isAsc);
					case 'expensesCount':
						return this.compare(a.expensesCount, b.expensesCount, isAsc);
					case 'costs':
						return this.compare(a.spending, b.spending, isAsc);
					case 'expenses':
						return this.compare(a.expenses, b.expenses, isAsc);
					case 'balance':
						return this.compare(a.balance, b.balance, isAsc);
					default:
						return 0;
				}
			}),
		];
		this.usersWithBalance$.next(this.usersWithBalance);
	}

	gotoInfo() {
		this.router.navigate(['events', this.event.id, 'info']);
	}

	gotoSettings() {
		this.router.navigate(['events', this.event.id, 'settings']);
	}

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.username]);
		}
	}

	gotoUserExpenses(user: UserBalance) {
		if (user.expensesCount < 1) {
			return;
		}
		this.router.navigate(['events', this.event.id, 'expenses'], {
			queryParams: { payers: user.user.id },
		});
	}

	gotoPayments() {
		this.router.navigate(['events', this.event.id, 'payment']);
	}

	private compare(a: string | number, b: string | number, isAsc: boolean) {
		if (a === b) return 0;
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	ngOnDestroy(): void {
		this.userSubscription?.unsubscribe();
		this.addUserSubscription?.unsubscribe();
		this.eventSubscription?.unsubscribe();
		this.dataSources.forEach((dataSource) => dataSource.destroy());
	}
}
