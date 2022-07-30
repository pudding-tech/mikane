import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PuddingEvent } from '../event/event.service';
import { User } from '../user/user.service';

export interface UserEvent {
	eventId: number,
	userId: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventUserService {
  private apiUrl = environment.apiUrl + 'eventusers';
  constructor(private httpClient: HttpClient) { }

  /* createEventUser(event: PuddingEvent, user: User) {
    return this.httpClient.post<PuddingEvent>(this.apiUrl)
  } */
}
