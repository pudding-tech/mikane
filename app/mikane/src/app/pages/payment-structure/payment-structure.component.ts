import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { EventService, Payment } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ProgressSpinnerComponent } from '../../shared/progress-spinner/progress-spinner.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf, NgFor, AsyncPipe, CurrencyPipe } from '@angular/common';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BreakpointService } from 'src/app/services/breakpoint/breakpoint.service';
import { PaymentItemComponent } from 'src/app/features/mobile/payment-item/payment-item.component';

@Component({
	selector: 'app-payment-structure',
	templateUrl: './payment-structure.component.html',
	styleUrls: ['./payment-structure.component.scss'],
	standalone: true,
	imports: [
		NgIf,
		MatButtonModule,
		MatIconModule,
		MatExpansionModule,
		NgFor,
		MatTableModule,
		ProgressSpinnerComponent,
		MatCardModule,
		MatListModule,
		AsyncPipe,
		CurrencyPipe,
		PaymentItemComponent,
	],
})
export class PaymentStructureComponent implements OnInit {
	@ViewChild(MatAccordion) accordion!: MatAccordion;

	private eventId!: string;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	displayedColumns: string[] = ['name', 'amount'];
	allExpanded = true;

	payments: Payment[] = [];
	senders: {
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	}[] = [];
	currentUser: User;

	constructor(
		private authService: AuthService,
		private eventService: EventService,
		private route: ActivatedRoute,
		private messageService: MessageService,
		public breakpointService: BreakpointService
	) {}

	ngOnInit(): void {
		this.route?.parent?.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadPayments();
		});
		this.authService.getCurrentUser().subscribe({
			next: (user) => {
				this.currentUser = user;
				this.loading.next(false);
			},
			error: (error: ApiError) => {
				this.messageService.showError('Something went wrong');
				console.error('something went wrong when getting current user on account page', error);
				this.loading.next(false);
			},
		})
	}

	loadPayments() {
		this.loading.next(true);
		this.eventService.loadPayments(this.eventId).subscribe({
			next: (payments) => {
				this.payments = payments;
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
						}
					);
				});

				this.loading.next(false);
			},
			error: (err: ApiError) => {
				this.loading.next(false);
				this.messageService.showError('Error loading payments');
				console.error('something went wrong whikle loading payments', err?.error?.message);
			},
		});
	}

	toggleExpand() {
		if (this.allExpanded) {
			this.accordion.closeAll();
			this.allExpanded = false;
		} else {
			this.accordion.openAll();
			this.allExpanded = true;
		}
	}

	panelToggled() {
		if (this.accordion._headers.toArray().every((panel) => panel._isExpanded())) {
			this.allExpanded = true;
		} else if (!this.accordion._headers.some((panel) => panel._isExpanded())) {
			this.allExpanded = false;
		}
	}
}
