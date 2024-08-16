import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';

export interface ValidationResult {
	valid: boolean;
}

@Injectable({
	providedIn: 'root',
})
export class FormValidationService {
	private httpClient = inject(HttpClient);
	private env = inject<Environment>(ENV);

	private apiUrl = this.env.apiUrl + 'validation';

	/**
	 * Check if a given username is available for use. User ID in body is optional, and used when validating against a specific user.
	 * @param username
	 * @param userId
	 * @returns
	 */
	validateUsername(username: string, userId?: string): Observable<ValidationResult> {
		return this.httpClient.post<ValidationResult>(this.apiUrl + '/user/username', { username, userId });
	}

	/**
	 * Check if a given email is available for use. User ID in body is optional, and used when validating against a specific user.
	 * @param email
	 * @param userId
	 * @returns
	 */
	validateEmail(email: string, userId?: string): Observable<ValidationResult> {
		return this.httpClient.post<ValidationResult>(this.apiUrl + '/user/email', { email, userId });
	}

	/**
	 * Check if a given phone number is available for use. User ID in body is optional, and used when validating against a specific user.
	 * @param phone
	 * @param userId
	 * @returns
	 */
	validatePhone(phone: string, userId?: string): Observable<ValidationResult> {
		return this.httpClient.post<ValidationResult>(this.apiUrl + '/user/phone', { phone, userId });
	}

	/**
	 * Check if a given event name is available for use. Event ID in body is optional, and used when validating against a specific event.
	 * @param name
	 * @param eventId
	 * @returns
	 */
	validateEventName(name: string, eventId?: string): Observable<ValidationResult> {
		return this.httpClient.post<ValidationResult>(this.apiUrl + '/event/name', { name, eventId });
	}

	/**
	 * Check if a given category name is available for use within an event. Category ID in body is optional, and used when validating against a specific category.
	 * @param name
	 * @param eventId
	 * @param categoryId
	 * @returns
	 */
	validateCategoryName(name: string, eventId: string, categoryId?: string): Observable<ValidationResult> {
		return this.httpClient.post<ValidationResult>(this.apiUrl + '/category/name', { name, eventId, categoryId });
	}
}
