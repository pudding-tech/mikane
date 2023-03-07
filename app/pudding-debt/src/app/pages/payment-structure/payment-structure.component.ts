import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import { EventService, Payment } from 'src/app/services/event/event.service';
import { MessageService } from 'src/app/services/message/message.service';
import { User } from 'src/app/services/user/user.service';
import { ApiError } from 'src/app/types/apiError.type';

@Component({
	selector: 'app-payment-structure',
	templateUrl: './payment-structure.component.html',
	styleUrls: ['./payment-structure.component.scss'],
})
export class PaymentStructureComponent implements OnInit {
	@ViewChild(MatAccordion) accordion!: MatAccordion;

	private eventId!: number;

	loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

	displayedColumns: string[] = ['name', 'amount'];

	payments: Payment[] = [];
	senders: {
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	}[] = [];

	constructor(private eventService: EventService, private route: ActivatedRoute, private messageService: MessageService) {}

	ngOnInit(): void {
		this.route?.parent?.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadPayments();
		});
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
}
