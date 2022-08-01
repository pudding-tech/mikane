import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { PuddingEvent } from '../event/event.service';

export interface User {
	id: number;
	name: string;
}

@Injectable({
	providedIn: 'root'
})
export class UserService {  
    private apiUrl = environment.apiUrl + 'users';
    constructor(private httpClient: HttpClient) { }

    loadUsers(): Observable<User[]> {
      	return this.httpClient.get<User[]>(this.apiUrl);
    }

	loadUsersForEvent(eventId: number) {
		return this.httpClient.get<User[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	createUser(eventId: number, name: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, { name: name, eventId: eventId });
	}
}
