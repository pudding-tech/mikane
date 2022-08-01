import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PuddingEvent {
	id: number;
	name: string;
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

    addUser(eventId: number, userId: number): Observable<PuddingEvent> {
        return this.httpClient.post<PuddingEvent>(this.apiUrl + `/${eventId}/user`, { userId });
    }
}
