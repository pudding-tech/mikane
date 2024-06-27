import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash-es';
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
	receivers: Array<{
		receiver: User;
		amount: number;
	}>;
}

@Component({
	templateUrl: './payment-structure.component.html',
	styleUrls: ['./payment-structure.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		MatTableModule,
		ProgressSpinnerComponent,
		MatCardModule,
		MatListModule,
		CurrencyPipe,
		PaymentExpansionPanelItemComponent,
		PaymentItemComponent,
	],
})
export class PaymentStructureComponent implements OnInit {
	@ViewChild('paymentsSelfRef') paymentsSelfRef!: PaymentExpansionPanelItemComponent;
	@ViewChild('paymentsOthersRef') paymentsOthersRef!: PaymentExpansionPanelItemComponent;

	private eventId!: string;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	allExpandedSelf = true;
	allExpandedOthers = false;

	senders: SenderPayments[] = [];
	paymentsSelf: SenderPayments[] = [];
	paymentsOthers: SenderPayments[] = [];
	currentUser: User;

	constructor(
		private authService: AuthService,
		private eventService: EventService,
		private route: ActivatedRoute,
		private messageService: MessageService,
		public breakpointService: BreakpointService,
	) {}

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
				map(payments, (payment) => {
					if (
						this.senders.find((sender) => {
							return sender.sender.id === payment.sender.id;
						}) === undefined
					) {
						this.senders.push({
							sender: payment.sender,
							receivers: [],
						});
					}
				});

				map(this.senders, (sender) => {
					map(
						payments.filter((payment) => {
							return payment.sender.id === sender.sender.id;
						}),
						(payment) => {
							sender.receivers.push({
								receiver: payment.receiver,
								amount: payment.amount,
							});
						},
					);
				});

				this.senders.forEach((sender) => {
					if (
						sender.sender.id === this.currentUser?.id ||
						sender.receivers.find((receiver) => receiver.receiver.id === this.currentUser?.id)
					) {
						this.paymentsSelf.push(sender);
					} else {
						this.paymentsOthers.push(sender);
					}
				});

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

	panelToggled = (index: number, allPanelsExpanded: boolean) => {
		if (index === 1) {
			this.allExpandedSelf = allPanelsExpanded;
		} else if (index === 2) {
			this.allExpandedOthers = allPanelsExpanded;
		}
	};
}
