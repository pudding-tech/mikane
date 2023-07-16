import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { CategoryIcon } from 'src/app/types/enums';
import { environment } from 'src/environments/environment';

export interface Category {
	id: string;
	name: string;
	icon: CategoryIcon;
	weighted: boolean;
	users: {
		id: string;
		name: string;
		weight?: number;
	}[];
}

@Injectable({
	providedIn: 'root',
})
export class CategoryService {
	private apiUrl = environment.apiUrl + 'categories';

	constructor(private httpClient: HttpClient) {}

	loadCategories(eventId: string): Observable<Category[]> {
		return this.httpClient.get<Category[]>(this.apiUrl + `?eventId=${eventId}`);
	}

	createCategory(name: string, eventId: string, weighted: boolean, icon: CategoryIcon): Observable<Category> {
		return this.httpClient.post<Category>(this.apiUrl, {
			name,
			eventId,
			weighted,
			icon,
		});
	}

	addUser(categoryId: string, userId: string, weight: number): Observable<Category> {
		return this.httpClient.post<Category>(this.apiUrl + `/${categoryId}/user/${userId}`, { weight });
	}

	deleteUser(categoryId: string, userId: string): Observable<Category> {
		return this.httpClient.delete<Category>(this.apiUrl + `/${categoryId}/user/${userId}`);
	}

	editUser(categoryId: string, userId: string, weight: number): Observable<Category> {
		return this.httpClient.put<Category>(this.apiUrl + `/${categoryId}/user/${userId}`, { weight });
	}

	setWeighted(categoryId: string, weighted: boolean): Observable<Category> {
		return this.httpClient.put<Category>(this.apiUrl + `/${categoryId}/weighted`, { weighted });
	}

	deleteCategory(categoryId: string): Observable<Category[]> {
		return this.httpClient.delete<Category[]>(this.apiUrl + `/${categoryId}`);
	}

	findOrCreate(eventId: string, categoryName: string): Observable<Category> {
		return this.loadCategories(eventId).pipe(
			map((categories): Category | undefined => {
				return categories.find((c) => c.name === categoryName);
			}),
			switchMap((category) => {
				if (category) {
					return of(category);
				} else {
					return this.createCategory(categoryName, eventId, false, CategoryIcon.SHOPPING);
				}
			})
		);
	}
}
