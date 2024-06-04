import { CommonModule } from '@angular/common';
import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
	computed,
	signal,
} from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, filter, map, of, skip, switchMap, take, takeUntil } from 'rxjs';
import { ExpenseItemComponent } from 'src/app/features/mobile/expense-item/expense-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { ContextService } from 'src/app/services/context/context.service';
import { ScrollService } from 'src/app/services/scroll/scroll.service';
import { EventStatusType, PuddingEvent } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { ExpenditureDialogComponent } from './expenditure-dialog/expenditure-dialog.component';
import { ExpenseBottomSheetComponent } from './expense-bottom-sheet/expense-bottom-sheet.component';

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
		MatSelectModule,
		MatCardModule,
		MatDialogModule,
		MatListModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatChipsModule,
		MatBottomSheetModule,
	],
})
export class ExpendituresComponent implements OnInit, OnDestroy {
	@Input() $event: BehaviorSubject<PuddingEvent>;
	event!: PuddingEvent;

	private sortValue = signal<Sort>({} as Sort);
	protected expenses = signal<Expense[]>([]);
	protected payers = signal<User[]>([]);
	protected categories = signal<Array<{ id: string; name: string; icon: string }>>([]);

	filteredExpenses = computed(() => {
		return this.sortData(this.sortValue(), this.expenses()).filter((expense) => {
			if (this.payersFilter().length && !this.payersFilter().includes(expense.payer.id)) {
				return false;
			}
			if (this.categoriesFilter().length && !this.categoriesFilter().includes(expense.categoryInfo.id)) {
				return false;
			}
			return this.expenseToString(expense).includes(this.filterValue().toLowerCase());
		});
	});

	protected filterValue = signal<string>('');
	protected payersFilter = signal<string[]>([]);
	protected payersFilterSelect: string[] = [];
	protected categoriesFilter = signal<string[]>([]);
	protected categoriesFilterSelect: string[] = [];
	protected filteredPayer = computed(() => {
		return this.payers().find((payer) => this.payersFilter().includes(payer.id));
	});
	protected filteredCategory = computed(() => {
		return this.categories().find((category) => this.categoriesFilter().includes(category.id));
	});

	@ViewChild('input') set filterInput(input: ElementRef<HTMLInputElement>) {
		if (input) {
			this._filterInput = input;
		}
	}

	private eventSubscription: Subscription;
	private _filterInput: ElementRef<HTMLInputElement>;

	loading = false;
	cancel$: Subject<void> = new Subject();
	destroy$: Subject<void> = new Subject();
	readonly EventStatusType = EventStatusType;

	displayedColumns: string[] = ['icon', 'name', 'payer', 'amount', 'categoryName', 'description'];
	currentUserId: string;

	constructor(
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private authService: AuthService,
		public dialog: MatDialog,
		private messageService: MessageService,
		public breakpointService: BreakpointService,
		public contextService: ContextService,
		public scrollService: ScrollService,
		private route: ActivatedRoute,
		private router: Router,
		private changeDetector: ChangeDetectorRef,
		private bottomSheet: MatBottomSheet,
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
				switchMap((event): Observable<[Expense[], string[]] | []> => {
					if (event.id) {
						if (event.status.id === EventStatusType.ACTIVE) {
							this.displayedColumns.push(...['edit', 'delete']);
						}
						this.event = event;
						return combineLatest([
							this.expenseService.loadExpenses(this.event.id),
							this.route.queryParamMap.pipe(
								map((params) => {
									return [params.get('filter'), params.get('payers'), params.get('categories')];
								}),
								take(1),
							),
						]);
					} else {
						return of([]);
					}
				}),
			)
			.subscribe({
				next: ([expenses, params]) => {
					this.expenses.set(expenses);

					const uniquePayersSet = new Set<string>();
					const uniqueCategoriesSet = new Set<string>();
					this.expenses().map((expense) => {
						if (!uniquePayersSet.has(expense.payer.id)) {
							uniquePayersSet.add(expense.payer.id);
							this.payers().push(expense.payer);
						}
						if (!uniqueCategoriesSet.has(expense.categoryInfo.id)) {
							uniqueCategoriesSet.add(expense.categoryInfo.id);
							this.categories().push(expense.categoryInfo);
						}
					});

					this.loading = false;
					this.changeDetector.detectChanges();
					if (params[0]) {
						this.filterValue.set(params[0]);
						if (this._filterInput) {
							this._filterInput.nativeElement.value = params[0];
						}
					} else {
						this.clearFilter();
					}
					if (params[1]) {
						this.payersFilter.set(params[1].split(';'));
						this.payersFilterSelect = params[1].split(';');
					}
					if (params[2]) {
						this.categoriesFilter.set(params[2].split(';'));
						this.categoriesFilterSelect = params[2].split(';');
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

		let newExpense: {
			name: string;
			description?: string;
			amount: number;
			payer: string;
		};
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
				takeUntil(this.cancel$),
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.createExpense(
						newExpense.name,
						newExpense.description,
						newExpense.amount,
						category.id,
						newExpense.payer,
					);
				}),
				takeUntil(this.destroy$),
			)
			.subscribe({
				next: (expense) => {
					this.expenses.update((expenses) => {
						expenses.unshift(expense);
						return [...expenses];
					});
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
		let editExpense: Expense;

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
					editExpense = expense;
					return this.categoryService.findOrCreate(this.event.id, expense?.category);
				}),
				takeUntil(this.cancel$),
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.editExpense(
						oldExpense.id,
						editExpense.name,
						editExpense.description ?? undefined,
						editExpense.amount,
						category.id,
						editExpense.payer as unknown as string,
					);
				}),
				takeUntil(this.destroy$),
			)
			.subscribe({
				next: (newExpense) => {
					const index = this.expenses().indexOf(this.expenses().find((expense) => expense.id === newExpense.id));
					if (~index) {
						this.expenses.update((expenses) => {
							expenses[index] = newExpense;
							return [...expenses];
						});
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
					this.expenses.update((expenses) => {
						expenses.splice(index, 1);
						return [...expenses];
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

	gotoUserProfile(user: User) {
		if (!user.guest) {
			this.router.navigate(['u', user.id]);
		}
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.filterValue.update(() => {
			return filterValue;
		});

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

	payerSelected() {
		this.payersFilter.set(this.payersFilterSelect);

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				...this.route.snapshot.queryParams,
				payers: this.payersFilter().toString().replace(new RegExp(',', 'g'), ';') || null,
			},
			replaceUrl: true,
			queryParamsHandling: 'merge',
		});
	}

	categorySelected() {
		this.categoriesFilter.set(this.categoriesFilterSelect);

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams: {
				...this.route.snapshot.queryParams,
				categories: this.categoriesFilter().toString().replace(new RegExp(',', 'g'), ';') || null,
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

	openFilterSearchBottomSheet(): void {
		const searchBottomSheetRef = this.bottomSheet.open(ExpenseBottomSheetComponent, {
			data: { type: 'search', currentFilter: [this.filterValue()] },
		});

		searchBottomSheetRef.instance.inputDataChange.subscribe((filterValue) => {
			this.filterValue.set(filterValue[0]);
			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: {
					...this.route.snapshot.queryParams,
					filter: filterValue[0] || null,
				},
				replaceUrl: true,
				queryParamsHandling: 'merge',
			});
		});
	}

	openFilterPayerBottomSheet(): void {
		const payerBottomSheetRef = this.bottomSheet.open(ExpenseBottomSheetComponent, {
			data: { type: 'payers', filterData: this.payers(), currentFilter: this.payersFilter() },
		});

		payerBottomSheetRef.instance.inputDataChange.subscribe((payers) => {
			this.payersFilter.set([...payers]);
			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: {
					...this.route.snapshot.queryParams,
					payers: this.payersFilter().toString().replace(new RegExp(',', 'g'), ';') || null,
				},
				replaceUrl: true,
				queryParamsHandling: 'merge',
			});
		});
	}

	openFilterCategoryBottomSheet(): void {
		const categoryBottomSheetRef = this.bottomSheet.open(ExpenseBottomSheetComponent, {
			data: { type: 'categories', filterData: this.categories(), currentFilter: this.categoriesFilter() },
		});

		categoryBottomSheetRef.instance.inputDataChange.subscribe((categories) => {
			this.categoriesFilter.set([...categories]);
			this.router.navigate([], {
				relativeTo: this.route,
				queryParams: {
					...this.route.snapshot.queryParams,
					categories: this.categoriesFilter().toString().replace(new RegExp(',', 'g'), ';') || null,
				},
				replaceUrl: true,
				queryParamsHandling: 'merge',
			});
		});
	}

	ngOnDestroy(): void {
		this.eventSubscription?.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}
}
