import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../user/user.service';

export interface Category {
	id: number;
	name: string;
	// users: [...{ id: number; name: string; weight: number }[]];
	users: User[];
}

@Injectable({
	providedIn: 'root',
})
export class CategoryService {
	private apiUrl = environment.apiUrl + 'categories';

	constructor(private httpClient: HttpClient) {}

	loadCategories(eventId: number): Observable<Category[]> {
		return this.httpClient.get<Category[]>(
			this.apiUrl + `?eventId=${eventId}`
		);
	}

	createCategory(name: string, eventId: number): Observable<Category> {
		return this.httpClient.post<Category>(this.apiUrl, { name, eventId });
	}

	addUser(
		categoryId: number,
		userId: number,
		weight: number
	): Observable<Category[]> {
		return this.httpClient.post<Category[]>(
			this.apiUrl + `/${categoryId}/user`,
			{ userId, weight }
		);
	}

    deleteUser(categoryId: number, userId: number): Observable<Category[]> {
        return this.httpClient.delete<Category[]>(this.apiUrl + `/${categoryId}/user/${userId}`);
    }
}
