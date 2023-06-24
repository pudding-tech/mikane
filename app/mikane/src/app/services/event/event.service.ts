import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User, UserBalance } from '../user/user.service';

export interface PuddingEvent {
	id: number;
	uuid: string;
	name: string;
	description: string;
	created: Date;
	adminIds: number[];
	private: boolean;
	user?: {
		id: number;
		inEvent: boolean;
		isAdmin: boolean;
	}
}

export interface Payment {
	sender: User;
	receiver: User;
	amount: number;
}

@Injectable({
	providedIn: 'root',
})
export class EventService {
	private apiUrl = environment.apiUrl + 'events';

	constructor(private httpClient: HttpClient) {}

	loadEvents(): Observable<PuddingEvent[]> {
		return this.httpClient.get<PuddingEvent[]>(this.apiUrl);
	}

	loadBalances(eventId: number): Observable<UserBalance[]> {
		return this.httpClient.get<UserBalance[]>(this.apiUrl + `/${eventId}/balances`);
	}

	loadPayments(eventId: number): Observable<Payment[]> {
		return this.httpClient.get<Payment[]>(this.apiUrl + `/${eventId}/payments`);
	}

	createEvent({ name, description }: { name: string; description: string }): Observable<PuddingEvent> {
		return this.httpClient.post<PuddingEvent>(this.apiUrl, { name, description, private: false });
	}

	editEvent({ id, name, description }: { id: number; name: string; description: string }): Observable<PuddingEvent> {
		return this.httpClient.put<PuddingEvent>(this.apiUrl + `/${id}`, { name, description, private: false });
	}

	deleteEvent(eventId: number): Observable<void> {
		return this.httpClient.delete<void>(this.apiUrl + `/${eventId}`);
	}

	addUser(eventId: number, userId: number): Observable<PuddingEvent> {
		return this.httpClient.post<PuddingEvent>(this.apiUrl + `/${eventId}/user/${userId}`, {});
	}

	removeUser(eventId: number, userId: number): Observable<PuddingEvent> {
		return this.httpClient.delete<PuddingEvent>(this.apiUrl + `/${eventId}/user/${userId}`);
	}
}
