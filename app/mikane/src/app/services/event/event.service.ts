import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { User, UserBalance } from '../user/user.service';

export interface PuddingEvent {
	id: string;
	name: string;
	description: string;
	created: Date;
	adminIds: string[];
	private: boolean;
	status: {
		id: number;
		name: string;
	};
	userInfo?: {
		id: string;
		inEvent: boolean;
		isAdmin: boolean;
	};
}

export interface Payment {
	sender: User;
	receiver: User;
	amount: number;
}

export enum EventStatusType {
	ACTIVE = 1,
	READY_TO_SETTLE = 2,
	SETTLED = 3,
}

@Injectable({
	providedIn: 'root',
})
export class EventService {
	private httpClient = inject(HttpClient);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl + 'events';

	loadEvents(): Observable<PuddingEvent[]> {
		return this.httpClient.get<PuddingEvent[]>(this.apiUrl);
	}

	loadBalances(eventId: string): Observable<UserBalance[]> {
		return this.httpClient.get<UserBalance[]>(this.apiUrl + `/${eventId}/balances`);
	}

	loadPayments(eventId: string): Observable<Payment[]> {
		return this.httpClient.get<Payment[]>(this.apiUrl + `/${eventId}/payments`);
	}

	getEvent(eventId: string): Observable<PuddingEvent> {
		return this.httpClient.get<PuddingEvent>(this.apiUrl + `/${eventId}`);
	}

	createEvent({
		name,
		description,
		privateEvent,
	}: {
		name: string;
		description: string;
		privateEvent: boolean;
	}): Observable<PuddingEvent> {
		return this.httpClient.post<PuddingEvent>(this.apiUrl, { name, description, private: privateEvent });
	}

	editEvent({
		id,
		name,
		description,
		privateEvent,
		status,
	}: {
		id: string;
		name?: string;
		description?: string;
		privateEvent?: boolean;
		status?: EventStatusType;
	}): Observable<PuddingEvent> {
		return this.httpClient.put<PuddingEvent>(this.apiUrl + `/${id}`, { name, description, private: privateEvent, status });
	}

	deleteEvent(eventId: string): Observable<void> {
		return this.httpClient.delete<void>(this.apiUrl + `/${eventId}`);
	}

	addUser(eventId: string, userId: string): Observable<PuddingEvent> {
		return this.httpClient.post<PuddingEvent>(this.apiUrl + `/${eventId}/user/${userId}`, {});
	}

	removeUser(eventId: string, userId: string): Observable<PuddingEvent> {
		return this.httpClient.delete<PuddingEvent>(this.apiUrl + `/${eventId}/user/${userId}`);
	}

	setUserAsAdmin(eventId: string, userId: string): Observable<PuddingEvent> {
		return this.httpClient.post<PuddingEvent>(this.apiUrl + `/${eventId}/admin/${userId}`, {});
	}

	removeUserAsAdmin(eventId: string, userId: string): Observable<PuddingEvent> {
		return this.httpClient.delete<PuddingEvent>(this.apiUrl + `/${eventId}/admin/${userId}`);
	}

	sendReadyToSettleEmails(eventId: string): Observable<void> {
		return this.httpClient.post<void>(this.env.apiUrl + `/notifications/${eventId}/settle`, {});
	}
}
