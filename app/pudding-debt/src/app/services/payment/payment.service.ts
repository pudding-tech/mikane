import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../user/user.service';

export interface Payment {
    sender: User,
    receiver: User,
    amount: number
}

@Injectable({
	providedIn: 'root',
})
export class PaymentService {
	private apiUrl = environment.apiUrl + 'payments';

	constructor(private httpClient: HttpClient) {}

	loadPayments(eventId: number) {
        return this.httpClient.get<Payment[]>(this.apiUrl);
    }
}
