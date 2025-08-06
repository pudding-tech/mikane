import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PaymentItemComponent } from 'src/app/features/mobile/payment-item/payment-item.component';
import { PaymentExpansionPanelItemComponent } from 'src/app/pages/payment-structure/payment-expansion-panel-item/payment-expansion-panel-item.component';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { EventService } from 'src/app/services/event/event.service';
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
export class PaymentStructureComponent implements OnInit {
	private authService = inject(AuthService);
	private eventService = inject(EventService);
	private route = inject(ActivatedRoute);
	private messageService = inject(MessageService);
	breakpointService = inject(BreakpointService);

	@ViewChild('paymentsSelfRef') paymentsSelfRef!: PaymentExpansionPanelItemComponent;
	@ViewChild('paymentsOthersRef') paymentsOthersRef!: PaymentExpansionPanelItemComponent;

	private eventId!: string;

	loading = new BehaviorSubject<boolean>(false);

	senders = signal<SenderPayments[]>([]);
	paymentsSelf = computed(() => this.senders().filter(senderPayment => {
		return senderPayment.sender.id === this.currentUser?.id || senderPayment.receivers.some(r => r.receiver.id === this.currentUser?.id);
	}));
	paymentsOthers = computed(() => this.senders().filter(senderPayment => {
		return !(senderPayment.sender.id === this.currentUser?.id || senderPayment.receivers.some(r => r.receiver.id === this.currentUser?.id))
	}));

	expandedSelf = signal<Set<string>>(new Set());
	expandedOthers = signal<Set<string>>(new Set());
	allExpandedSelf = true;
	allExpandedOthers = false;
	currentUser: User;

	ngOnInit(): void {
		this.route?.parent?.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadPayments();
		});
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				this.currentUser = user;
			},
			error: (error: ApiError) => {
				this.messageService.showError('Something went wrong');
				console.error('something went wrong when getting current user on account page', error);
			},
		});
	}

	private loadPayments() {
		this.loading.next(true);
		this.eventService.loadPayments(this.eventId).subscribe({
			next: (payments) => {
				// Build unique senders
				const uniqueSenders: SenderPayments[] = [];
				payments.forEach(payment => {
					if (!uniqueSenders.find(s => s.sender.id === payment.sender.id)) {
						uniqueSenders.push({ sender: payment.sender, receivers: [] });
					}
				});

				// Assign receivers to each sender
				const updatedSenders = uniqueSenders.map(sender => {
					const receivers = payments
						.filter(payment => payment.sender.id === sender.sender.id)
						.map(payment => ({
							receiver: payment.receiver,
							amount: payment.amount,
						}));
					return { ...sender, receivers };
				});

				this.senders.set(updatedSenders);
				this.expandedSelf.set(new Set(this.paymentsSelf().map(p => p.sender.id)));
				this.loading.next(false);
			},
			error: (err: ApiError) => {
				this.loading.next(false);
				this.messageService.showError('Error loading payments');
				console.error('something went wrong while loading payments', err?.error?.message);
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
				this.expandedSelf.set(new Set(this.paymentsSelf().map(p => p.sender.id)));
				this.allExpandedSelf = true;
			}
		} else if (index === 2) {
			if (this.allExpandedOthers) {
				this.expandedOthers.set(new Set());
				this.allExpandedOthers = false;
			} else {
				this.expandedOthers.set(new Set(this.paymentsOthers().map(p => p.sender.id)));
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
		}
		else {
			set.delete(senderId);
		}

		if (self) {
			this.expandedSelf.set(set);
			if (this.expandedSelf().size === this.paymentsSelf().length) {
				this.allExpandedSelf = true;
			}
			else if (this.expandedSelf().size === 0) {
				this.allExpandedSelf = false;
			}
		}
		else {
			this.expandedOthers.set(set);
			if (this.expandedOthers().size === this.paymentsOthers().length) {
				this.allExpandedOthers = true;
			}
			else if (this.expandedOthers().size === 0) {
				this.allExpandedOthers = false;
			}
		}
	};
}
