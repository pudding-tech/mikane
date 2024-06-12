import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, filter, switchMap, takeUntil } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/features/confirm-dialog/confirm-dialog.component';
import { MenuComponent } from 'src/app/features/menu/menu.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { Category, CategoryService } from 'src/app/services/category/category.service';
import { EventService, PuddingEvent, EventStatusType } from 'src/app/services/event/event.service';
import { Expense, ExpenseService } from 'src/app/services/expense/expense.service';
import { MessageService } from 'src/app/services/message/message.service';
import { ProgressSpinnerComponent } from 'src/app/shared/progress-spinner/progress-spinner.component';
import { ApiError } from 'src/app/types/apiError.type';
import { ExpenditureDialogComponent } from '../expenditure-dialog/expenditure-dialog.component';

@Component({
	templateUrl: 'expense.component.html',
	styleUrls: ['./expense.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		ProgressSpinnerComponent,
		MenuComponent,
		MatDialogModule,
		MatIconModule,
		RouterLink,
		MatButtonModule,
		MatToolbarModule,
	],
})
export class ExpenseComponent implements OnInit, OnDestroy {
	protected loading = true;
	expense: Expense;
	event: PuddingEvent;
	currentUserId: string;

	readonly EventStatusType = EventStatusType;
	cancel$: Subject<void> = new Subject();
	destroy$: Subject<void> = new Subject();

	constructor(
		public breakpointService: BreakpointService,
		private authService: AuthService,
		private eventService: EventService,
		private expenseService: ExpenseService,
		private categoryService: CategoryService,
		private messageService: MessageService,
		public dialog: MatDialog,
		private router: Router,
		private route: ActivatedRoute,
	) {}

	ngOnInit() {
		this.loading = true;
		const eventId = this.route.parent.parent.snapshot.paramMap.get('eventId');
		const expenseId = this.route.snapshot.paramMap.get('id');

		this.eventService
			.getEvent(eventId)
			.pipe(
				switchMap((event) => {
					this.event = event;
					return this.expenseService.getExpense(expenseId);
				}),
				takeUntil(this.destroy$),
			)
			.subscribe({
				next: (expense) => {
					this.expense = expense;
					this.loading = false;
				},
				error: (err: ApiError) => {
					this.loading = false;
					this.messageService.showError('Error loading expense');
					console.error('Something went wrong while loading expense', err?.error?.message);
				},
			});

		this.authService
			.getCurrentUser()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (user) => {
					this.currentUserId = user.id;
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to get user');
					console.error('Something went wrong getting signed in user', err?.error?.message);
				},
			});
	}

	editExpense() {
		let newExpense: Expense;

		this.dialog
			.open(ExpenditureDialogComponent, {
				width: '350px',
				data: {
					eventId: this.event.id,
					userId: this.currentUserId,
					expense: this.expense,
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
				takeUntil(this.cancel$),
			)
			.pipe(
				switchMap((category: Category) => {
					return this.expenseService.editExpense(
						this.expense.id,
						newExpense.name,
						newExpense.description ?? undefined,
						newExpense.amount,
						category.id,
						newExpense.payer as unknown as string,
					);
				}),
				takeUntil(this.destroy$),
			)
			.subscribe({
				next: (returnedExpense) => {
					this.expense = returnedExpense;
					this.messageService.showSuccess('Expense edited');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to edit expense');
					console.error('Something went wrong while editing expense', err);
				},
			});
	}

	removeExpense() {
		const dialogRef = this.dialog.open(ConfirmDialogComponent, {
			width: '350px',
			data: {
				title: 'Delete expense',
				content: 'Are you sure you want to delete this expense? This cannot be undone.',
				confirm: 'I am sure',
			},
		});

		dialogRef
			.afterClosed()
			.pipe(
				filter((confirm) => confirm),
				switchMap(() => this.expenseService.deleteExpense(this.expense.id)),
				takeUntil(this.destroy$),
			)
			.subscribe({
				next: () => {
					this.router.navigate(['events', this.event.id, 'expenses']);
					this.messageService.showSuccess('Expense successfully deleted');
				},
				error: (err: ApiError) => {
					this.messageService.showError('Failed to delete expense');
					console.error('Something went wrong while deleting expense', err?.error?.message);
				},
			});
	}

	goBack() {
		this.router.navigate(['events', this.event.id, 'expenses'], {
			queryParams: { ...this.route.snapshot.queryParams }
		});
	}

	gotoUserProfile() {
		if (!this.expense.payer.guest) {
			this.router.navigate(['u', this.expense.payer.username]);
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
