import { CommonModule } from '@angular/common';
import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	WritableSignal,
	computed,
	signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, filter, map, of, skip, switchMap, takeUntil } from 'rxjs';
import { ExpenseItemComponent } from 'src/app/features/mobile/expense-item/expense-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';

@Component({
	selector: 'app-expenditures',
	templateUrl: './expenditures.component.html',
	styleUrls: ['./expenditures.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTableModule,
		ProgressSpinnerComponent,
		ExpenseItemComponent,
		MatCardModule,
		MatDialogModule,
		MatListModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
	],
})
export class ExpendituresComponent implements OnInit, OnDestroy {
	@Input() $event: BehaviorSubject<PuddingEvent>;
	event!: PuddingEvent;

	private filterValue: WritableSignal<string> = signal('');
	private sortValue: WritableSignal<Sort> = signal({} as Sort);
	protected expenses: WritableSignal<Expense[]> = signal([]);
	filteredExpenses = computed(() => {
		return this.sortData(this.sortValue(), this.expenses()).filter((expense) => {
			return this.expenseToString(expense).includes(this.filterValue().toLowerCase());
		});
	});

	@ViewChild('input') set filterInput(input: ElementRef<HTMLInputElement>) {
		if (input) {
			this._filterInput = input;
		}
	}

	private eventSubscription: Subscription;
	private _filterInput: ElementRef<HTMLInputElement>;

	loading: boolean = false;
	cancel$: Subject<void> = new Subject();
	destroy$: Subject<void> = new Subject();

	displayedColumns: string[] = ['icon', 'name', 'payer', 'amount', 'categoryName', 'description', 'edit', 'delete'];
	currentUserId: string;

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private authService: AuthService,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService,
		public contextService: ContextService,
		private route: ActivatedRoute,
		private router: Router,
		private changeDetector: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.loading = true;
		this.breakpointService
			.isMobile()
			.pipe(skip(1), takeUntil(this.destroy$))
			.subscribe(() => this.clearInput());
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				this.currentUserId = user.id;
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to get user');
				console.error('Something went wrong getting signed in user in expenses component: ' + err?.error?.message);
			},
		});
		this.eventSubscription = this.$event
			?.pipe(
				filter((event) => event?.id !== undefined),
				switchMap((event): Observable<[Expense[], string] | []> => {
					if (event.id) {
						this.event = event;
						return combineLatest([
							this.expenseService.loadExpenses(this.event.id),
							this.route.queryParamMap.pipe(
								map((params) => {
									return params.get('filter');
								})
							),
						]);
					} else {
						return of([]);
					}
				})
			)
			.subscribe({
				next: ([expenses, params]) => {
					this.expenses.set(expenses);
					this.loading = false;
					this.changeDetector.detectChanges();
					if (params) {
						this.filterValue.set(params);
						this._filterInput.nativeElement.value = params;
					} else {
						this.clearFilter();
					}
				},
				error: (err: ApiError) => {
					this.loading = false;
					this.messageService.showError('Error loading expenses');
					console.error('something went wrong while loading expenses', err?.error?.message);
				},
			});
	}

	openDialog() {
		const dialogRef = this.dialog.open(ExpenditureDialogComponent, {
			width: '350px',
			data: {
				eventId: this.event.id,
				userId: this.currentUserId,
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
					return this.categoryService.findOrCreate(this.event.id, expense?.category);
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
				}),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: (expense) => {
					this.expenses.mutate((expenses) => expenses.unshift(expense));
					this.messageService.showSuccess('New expense created');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to create expense');
					console.error('something went wrong while creating expense', err?.error?.message);
				},
			});
	}

	editExpense(expenseId: string) {
		const oldExpense = this.expenses().find((expense) => expense.id === expenseId);
		let newExpense: Expense;

		this.dialog
			.open(ExpenditureDialogComponent, {
				width: '350px',
				data: {
					eventId: this.event.id,
					userId: this.currentUserId,
					expense: oldExpense,
				},
			})
			.afterClosed()
			.pipe(
				switchMap((expense) => {
					if (!expense) {
						this.cancel$.next();
					}
					newExpense = expense;
					return this.categoryService.findOrCreate(this.event.id, expense?.category);
				}),
				takeUntil(this.cancel$)
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.editExpense(
						oldExpense.id,
						newExpense.name,
						newExpense.description ?? undefined,
						newExpense.amount,
						category.id,
						newExpense.payer as unknown as string
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: (newExpense) => {
					const index = this.expenses().indexOf(this.expenses().find((expense) => expense.id === newExpense.id));
					if (~index) {
						this.expenses.mutate((expenses) => (expenses[index] = newExpense));
					}
					this.messageService.showSuccess('Expense edited');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to edit expense');
					console.error('something went wrong while editing expense', err);
				},
			});
	}

	removeExpense(expenseId: string) {
		this.expenseService.deleteExpense(expenseId).subscribe({
			next: () => {
				const index = this.expenses().indexOf(this.expenses().find((expense) => expense.id === expenseId));
				if (~index) {
					this.expenses.mutate((expenses) => {
						expenses.splice(index, 1);
					});
					this.messageService.showSuccess('Expense deleted');
				} else {
					this.messageService.showError('Failed to delete expense');
					console.error('something went wrong while deleting expense');
				}
			},
			error: (err: ApiError) => {
				this.messageService.showError('Failed to delete expense');
				console.error('something went wrong while deleting expense', err?.error?.message);
			},
		});
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filterValue.update(() => filterValue);

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				...this.route.snapshot.queryParams,
				filter: filterValue || null,
			},
			replaceUrl: true,
			queryParamsHandling: 'merge',
		});
	}

	clearFilter() {
		this.filterValue.update(() => '');
	}

	clearInput() {
		this.clearFilter();
		if (this._filterInput) {
			this._filterInput.nativeElement.value = '';
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				...this.route.snapshot.queryParams,
				filter: null,
			},
			replaceUrl: true,
			queryParamsHandling: 'merge',
		});
	}

	onSortData(sort: Sort) {
		this.sortValue.set(sort);
	}

	sortData(sort: Sort, expenses: Expense[]): Expense[] {
		if (!sort.active || sort.direction === '') {
			return [
				...expenses.sort((a, b) => {
					return this.compare(a.created, b.created, false);
				}),
			];
		}

		return [
			...expenses.sort((a, b) => {
				const isAsc = sort.direction === 'asc';
				switch (sort.active) {
					case 'name':
						return this.compare(a.name, b.name, isAsc);
					case 'payer':
						return this.compare(a.payer.name, b.payer.name, isAsc);
					case 'categoryName':
						return this.compare(a.categoryInfo.name, b.categoryInfo.name, isAsc);
					case 'amount':
						return this.compare(a.amount, b.amount, isAsc);
					case 'description':
						return this.compare(a.description, b.description, isAsc);
					default:
						return 0;
				}
			}),
		];
	}

	private compare(a: string | number, b: string | number, isAsc: boolean) {
		if (a === b) return 0;
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	private expenseToString(expense: Expense): string {
		return (expense.name + expense.categoryInfo.name + expense.payer.name + expense.amount.toString()).toLowerCase();
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}
}
