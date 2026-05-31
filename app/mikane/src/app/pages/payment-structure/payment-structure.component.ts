import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, skip, takeUntil } from 'rxjs';
import { PaymentItemComponent } from 'src/app/features/mobile/payment-item/payment-item.component';
import { PaymentExpansionPanelItemComponent } from 'src/app/pages/payment-structure/payment-expansion-panel-item/payment-expansion-panel-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventService } from 'src/app/services/event/event.service';
import { LogService } from 'src/app/services/log/log.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';

interface SenderPayments {
	sender: User;
	receivers: {
		receiver: User;
		amount: number;
	}[];
}

@Component({
	templateUrl: './payment-structure.component.html',
	styleUrls: ['./payment-structure.component.scss'],
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		MatTableModule,
		ProgressSpinnerComponent,
		MatCardModule,
		MatListModule,
		PaymentExpansionPanelItemComponent,
		PaymentItemComponent,
	],
})
export class PaymentStructureComponent implements OnInit, OnDestroy {
	private authService = inject(AuthService);
	private eventService = inject(EventService);
	private route = inject(ActivatedRoute);
	private messageService = inject(MessageService);
	breakpointService = inject(BreakpointService);
	private logService = inject(LogService);

	@ViewChild('paymentsSelfRef') paymentsSelfRef!: PaymentExpansionPanelItemComponent;
	@ViewChild('paymentsOthersRef') paymentsOthersRef!: PaymentExpansionPanelItemComponent;

	private eventId!: string;

	loading = new BehaviorSubject<boolean>(false);

	senders = signal<SenderPayments[]>([]);
	// Keep this reactive so paymentsSelf/paymentsOthers update if the user loads after payments.
	currentUser = signal<User | undefined>(undefined);
	paymentsSelf = computed(() => {
		const user = this.currentUser();
		return this.senders().filter((senderPayment) => {
			return senderPayment.sender.id === user?.id || senderPayment.receivers.some((r) => r.receiver.id === user?.id);
		});
	});
	paymentsOthers = computed(() => {
		const user = this.currentUser();
		return this.senders().filter((senderPayment) => {
			return !(senderPayment.sender.id === user?.id || senderPayment.receivers.some((r) => r.receiver.id === user?.id));
		});
	});

	expandedSelf = signal<Set<string>>(new Set());
	expandedOthers = signal<Set<string>>(new Set());
	allExpandedSelf = true;
	allExpandedOthers = false;

	private destroy$ = new Subject<void>();

	ngOnInit(): void {
		this.route?.parent?.parent?.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadPayments();
		});
		this.authService
			.getCurrentUser()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (user) => {
					this.currentUser.set(user);
					// Payments may have loaded before currentUser resolved; re-seed the
					// mobile expand set now that paymentsSelf() has the correct user context.
					if (this.senders().length > 0) {
						this.expandedSelf.set(new Set(this.paymentsSelf().map((p) => p.sender.id)));
					}
				},
				error: (error: ApiError) => {
					this.messageService.showError('Something went wrong');
					this.logService.error('Something went wrong when getting current user on account page: ' + error);
				},
			});

		// Re-apply the shared expand state after the mobile/desktop view flips.
		this.breakpointService
			.isMobile()
			.pipe(skip(1), takeUntil(this.destroy$))
			.subscribe((isMobile) => {
				if (isMobile) {
					this.syncMobileFromBooleans();
				} else {
					// Defer one tick: the desktop branch's ViewChild resolves after the
					// `@if` flip completes and Angular re-runs its view queries.
					setTimeout(() => this.syncDesktopFromBooleans(), 0);
				}
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private syncMobileFromBooleans(): void {
		this.expandedSelf.set(this.allExpandedSelf ? new Set(this.paymentsSelf().map((p) => p.sender.id)) : new Set());
		this.expandedOthers.set(this.allExpandedOthers ? new Set(this.paymentsOthers().map((p) => p.sender.id)) : new Set());
	}

	private syncDesktopFromBooleans(): void {
		if (this.paymentsSelfRef && this.paymentsSelf().length > 0) {
			this.paymentsSelfRef.openExpand(this.allExpandedSelf);
		}
		if (this.paymentsOthersRef && this.paymentsOthers().length > 0) {
			this.paymentsOthersRef.openExpand(this.allExpandedOthers);
		}
	}

	private loadPayments() {
		this.loading.next(true);
		this.eventService
			.loadPayments(this.eventId)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (payments) => {
					// Build unique senders
					const uniqueSenders: SenderPayments[] = [];
					payments.forEach((payment) => {
						if (!uniqueSenders.find((s) => s.sender.id === payment.sender.id)) {
							uniqueSenders.push({ sender: payment.sender, receivers: [] });
						}
					});

					// Assign receivers to each sender
					const updatedSenders = uniqueSenders.map((sender) => {
						const receivers = payments
							.filter((payment) => payment.sender.id === sender.sender.id)
							.map((payment) => ({
								receiver: payment.receiver,
								amount: payment.amount,
							}));
						return { ...sender, receivers };
					});

					this.senders.set(updatedSenders);
					this.expandedSelf.set(new Set(this.paymentsSelf().map((p) => p.sender.id)));
					this.loading.next(false);
				},
				error: (err: ApiError) => {
					this.loading.next(false);
					this.messageService.showError('Error loading payments');
					this.logService.error('Something went wrong while loading payments: ' + err?.error?.message);
				},
			});
	}

	toggleExpand = (index: number) => {
		if (index === 1) {
			if (this.allExpandedSelf) {
				this.paymentsSelfRef.openExpand(false);
				this.allExpandedSelf = false;
			} else {
				this.paymentsSelfRef.openExpand(true);
				this.allExpandedSelf = true;
			}
		} else if (index === 2) {
			if (this.allExpandedOthers) {
				this.paymentsOthersRef.openExpand(false);
				this.allExpandedOthers = false;
			} else {
				this.paymentsOthersRef.openExpand(true);
				this.allExpandedOthers = true;
			}
		}
	};

	toggleExpandMobile = (index: number) => {
		if (index === 1) {
			if (this.allExpandedSelf) {
				this.expandedSelf.set(new Set());
				this.allExpandedSelf = false;
			} else {
				this.expandedSelf.set(new Set(this.paymentsSelf().map((p) => p.sender.id)));
				this.allExpandedSelf = true;
			}
		} else if (index === 2) {
			if (this.allExpandedOthers) {
				this.expandedOthers.set(new Set());
				this.allExpandedOthers = false;
			} else {
				this.expandedOthers.set(new Set(this.paymentsOthers().map((p) => p.sender.id)));
				this.allExpandedOthers = true;
			}
		}
	};

	panelToggled = (index: number, allPanelsExpanded: boolean) => {
		if (index === 1) {
			this.allExpandedSelf = allPanelsExpanded;
		} else if (index === 2) {
			this.allExpandedOthers = allPanelsExpanded;
		}
	};

	paymentToggledMobile = (senderId: string, expanded: boolean, self: boolean) => {
		const set = new Set(self ? this.expandedSelf() : this.expandedOthers());
		if (expanded) {
			set.add(senderId);
		} else {
			set.delete(senderId);
		}

		if (self) {
			this.expandedSelf.set(set);
			if (this.expandedSelf().size === this.paymentsSelf().length) {
				this.allExpandedSelf = true;
			} else if (this.expandedSelf().size === 0) {
				this.allExpandedSelf = false;
			}
		} else {
			this.expandedOthers.set(set);
			if (this.expandedOthers().size === this.paymentsOthers().length) {
				this.allExpandedOthers = true;
			} else if (this.expandedOthers().size === 0) {
				this.allExpandedOthers = false;
			}
		}
	};
}
