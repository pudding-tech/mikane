import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { CategoryIcon } from 'src/app/types/enums';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';

export interface Category {
	id: string;
	name: string;
	icon: CategoryIcon;
	weighted: boolean;
	created: Date;
	numberOfExpenses: number;
	users: {
		id: string;
		name: string;
		username: string;
		guest: boolean;
		avatarURL: string;
		weight?: number;
	}[];
}

@Injectable({
	providedIn: 'root',
})
export class CategoryService {
	private httpClient = inject(HttpClient);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl + 'categories';

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

	editCategory(categoryId: string, name: string, icon: CategoryIcon): Observable<Category> {
		return this.httpClient.put<Category>(this.apiUrl + `/${categoryId}`, {
			name,
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
			}),
		);
	}
}
