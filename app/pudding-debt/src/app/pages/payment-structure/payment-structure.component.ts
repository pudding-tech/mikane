import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash';
import {
	Payment,
	PaymentService,
} from 'src/app/services/payment/payment.service';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-payment-structure',
	templateUrl: './payment-structure.component.html',
	styleUrls: ['./payment-structure.component.scss'],
})
export class PaymentStructureComponent implements OnInit {
    @ViewChild(MatAccordion) accordion!: MatAccordion;
    
	private eventId!: number;

	payments: Payment[] = [];
	senders: {
		sender: User;
		receivers: {
			receiver: User;
			amount: number;
		}[];
	}[] = [];

	constructor(
		private paymentService: PaymentService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.route.parent?.params.subscribe((params) => {
			this.eventId = params['eventId'];
			this.loadPayments();
		});
	}

	loadPayments() {
		this.paymentService.loadPayments(this.eventId).subscribe((payments) => {
			this.payments = payments;
			map(payments, (payment) => {
				if (
					this.senders.find((sender) => {
						sender.sender.id === payment.sender.id;
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
                        console.log('payment', payment);
						sender.receivers.push({
							receiver: payment.receiver,
							amount: payment.amount,
						});
					}
				);
			});

            console.log('senders', this.senders);
		});
	}

    expandAll() {

    }
}
