import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash';
import { Payment, PaymentService } from 'src/app/services/payment/payment.service';
import { User } from 'src/app/services/user/user.service';

@Component({
	selector: 'app-payment-structure',
	templateUrl: './payment-structure.component.html',
	styleUrls: ['./payment-structure.component.scss'],
})
export class PaymentStructureComponent implements OnInit {
    private eventId!: number;

	payments: Payment[] = [];
    senders: {
        sender: User,
        receivers: {
            receiver: User,
            amount: number
        }
    }[] = [];

    constructor(private paymentService: PaymentService, private route: ActivatedRoute) {}

	ngOnInit(): void {
        this.route.parent?.params.subscribe((params) => {
            this.eventId = params['eventId'];
            this.loadPayments();
        })
    }
    
    loadPayments() {
        /* this.paymentService.loadPayments(this.eventId).subscribe(payments => {
            this.payments = payments;
            map(payments, (payment) => {
                this.senders.push({
                    sender: payment.sender
                })
            })
        }); */
    }
}
