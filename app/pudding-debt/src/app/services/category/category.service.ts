import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PuddingEvent } from '../event/event.service';

export interface Category {
    id: number;
    name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
	private apiUrl = environment.apiUrl + 'categories';

	constructor(private httpClient: HttpClient) {}

	loadCategories(event: PuddingEvent): Observable<Category[]> {
        return this.httpClient.get<Category[]>(this.apiUrl + `?eventId=${event.id}`);
    }

    createCategory(name: string) {
        return this.httpClient.post<Category[]>(this.apiUrl, { name: name });
    }
}
