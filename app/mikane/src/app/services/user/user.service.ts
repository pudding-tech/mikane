import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Phonenumber } from 'src/app/types/phonenumber.type';
import { Environment } from 'src/environments/environment.interface';
import { ENV } from 'src/environments/environment.provider';
import { Expense } from '../expense/expense.service';

export interface User {
	id: string;
	name: string;
	username: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	created?: Date;
	guest: boolean;
	guestCreatedBy?: string;
	superAdmin?: boolean;
	publicEmail?: boolean;
	publicPhone?: boolean;
	avatarURL?: string;
	eventInfo?: {
		id: string;
		isAdmin: boolean;
		joinedTime: Date;
	};
	authenticated: boolean;
}

/**
 * {
 *   "user": {
 *     "id": "24b96dad-e95a-4794-9dea-25fd2bbd21a1",
 *     "username": "testuser",
 *     "name": "Test",
 *     "email": "test@user.com",
 *     "created": "2023-01-20T18:00:00",
 *     "avatarURL": "https://gravatar.com/avatar/aaaa",
 *     "eventInfo": {
 *       "id": "24b96dad-e95a-4794-9dea-25fd2bbd21a1",
 *       "isAdmin": false,
 *       "joinedDate": "2023-01-20T19:00:00"
 *     }
 *   },
 *   "expensesCount": 2,
 *   "spending": 100,
 *   "expenses": 200,
 *   "balance": 100
 * }
 */
export interface UserBalance {
	user: User;
	expensesCount: number;
	spending: number;
	expenses: number;
	balance: number;
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = this.env.apiUrl + 'users';
	constructor(private httpClient: HttpClient, @Inject(ENV) private env: Environment) {}

	/**
	 * Loads all users
	 * @param excludeSelf Exclude the current user from the list
	 * @returns Observable of User[]
	 */
	loadUsers(excludeSelf = false) {
		return this.httpClient.get<User[]>(this.apiUrl + (excludeSelf ? '?excludeSelf=true' : ''));
	}

	/**
	 * Loads all users associated with a given event.
	 * @param eventId The ID of the event to load users for.
	 * @param excludeGuests Whether to exclude guest users from the results.
	 * @returns An Observable that emits an array of User objects.
	 */
	loadUsersByEvent(eventId: string, excludeGuests?: boolean) {
		return this.httpClient.get<User[]>(this.apiUrl + `?eventId=${eventId}` + (excludeGuests ? '&excludeGuests=true' : ''));
	}

	/**
	 * Loads a user by their ID.
	 * @param userId The ID of the user to load.
	 * @returns An Observable that emits the loaded User object.
	 */
	loadUserById(userId: string) {
		return this.httpClient.get<User>(this.apiUrl + `/${userId}`);
	}

	/**
	 * Loads a user by their username or ID.
	 * @param usernameId The username or ID of the user to load.
	 * @returns An Observable that emits the loaded User object.
	 */
	loadUserByUsernameOrId(usernameId: string) {
		return this.httpClient.get<User>(this.apiUrl + `/username/${usernameId}`);
	}

	/**
	 * Creates a new user with the given name and event ID.
	 * @param eventId The ID of the event the user is associated with.
	 * @param name The name of the user.
	 * @returns An Observable that emits the newly created User object.
	 */
	createUser(eventId: string, name: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, { name: name, eventId: eventId, email: 'email', password: 'password' });
	}

	/**
	 * Loads the expenses for a given user and event.
	 * @param userId The ID of the user whose expenses to load.
	 * @param eventId The ID of the event for which to load expenses.
	 * @returns An Observable that emits an array of Expense objects.
	 */
	loadUserExpenses(userId: string, eventId: string): Observable<Expense[]> {
		return this.httpClient.get<Expense[]>(this.apiUrl + `/${userId}/expenses/${eventId}`);
	}

	/**
	 * Loads the user balance for a given event ID.
	 * @param eventId The ID of the event to load the user balance for.
	 * @returns An Observable that emits an array of UserBalance objects.
	 */
	loadUserBalance(eventId: string): Observable<UserBalance[]> {
		return this.httpClient.get<UserBalance[]>(this.apiUrl + `/balances?eventId=${eventId}`);
	}

	/**
	 * Updates a user's information.
	 * @param userId - The ID of the user to update.
	 * @param username - The user's new username.
	 * @param firstName - The user's new first name.
	 * @param lastName - The user's new last name.
	 * @param email - The user's new email address.
	 * @param phone - The user's new phone number.
	 * @returns An Observable that emits the updated User object.
	 */
	editUser(userId: string, username: string, firstName: string, lastName: string, email: string, phone: string): Observable<User> {
		return this.httpClient.put<User>(this.apiUrl + `/${userId}`, {
			username,
			firstName,
			lastName,
			email,
			phone,
		});
	}

	/**
	 * Updates a user's preferences.
	 * @param userId - The ID of the user to update.
	 * @param publicEmail - The user's public email property
	 * @param publicPhone - The user's public phone number property
	 * @returns An Observable that emits the updated User object.
	 */
	editUserPreferences(userId: string, publicEmail: boolean, publicPhone: boolean): Observable<User> {
		return this.httpClient.put<User>(this.apiUrl + `/${userId}/preferences`, {
			publicEmail,
			publicPhone,
		});
	}

	/**
	 * Deletes a user with the specified ID and key.
	 * @param userId The ID of the user to delete.
	 * @param key The key required to delete the user.
	 * @returns An Observable that emits an array of User objects after the user has been deleted.
	 */
	deleteUser(userId: string, key: string): Observable<User[]> {
		return this.httpClient.delete<User[]>(this.apiUrl + `/${userId}`, { body: { key } });
	}

	/**
	 * Registers a new user with the given information.
	 * @param username The username for the new user.
	 * @param firstName The first name of the new user.
	 * @param lastName The last name of the new user.
	 * @param email The email address of the new user.
	 * @param phone The phone number of the new user.
	 * @param password The password for the new user.
	 * @param key An optional key for the new user.
	 * @returns An Observable that emits the newly registered User object.
	 */
	registerUser(
		username: string,
		firstName: string,
		lastName: string,
		email: string,
		phone: Phonenumber,
		password: string,
		key?: string
	): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl, {
			username,
			firstName,
			lastName,
			email,
			phone: phone.number,
			password,
			key,
		});
	}

	/**
	 * Changes the password of the current user.
	 * @param currentPassword The user's current password.
	 * @param newPassword The user's new password.
	 * @returns An Observable that emits the updated User object.
	 */
	changeUserPassword(currentPassword: string, newPassword: string): Observable<User> {
		return this.httpClient.post<User>(this.apiUrl + '/changepassword', {
			currentPassword: currentPassword,
			newPassword: newPassword,
		});
	}

	/**
	 * Sends an invitation to a user with the specified email address.
	 * @param email The email address of the user to invite.
	 * @param guestId (Optional) The ID of the guest user associated with the invitation.
	 * @returns An Observable that resolves when the invitation is sent.
	 */
	inviteUser(email: string, guestId?: string): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + '/invite', {
			email,
			guestId,
		});
	}

	/**
	 * Sends a request to delete the user's account.
	 * @returns An Observable that emits void when the request is successful.
	 */
	requestDeleteAccount(): Observable<void> {
		return this.httpClient.post<void>(this.apiUrl + '/requestdeleteaccount', {});
	}

	/**
	 * Retrieves a list of guest users from the API.
	 * @returns An observable that emits an array of User objects.
	 */
	loadGuestUsers() {
		return this.httpClient.get<User[]>(this.env.apiUrl + '/guests');
	}

	/**
	 * Creates a new guest user with the given first and last name.
	 * @param firstName The first name of the guest user.
	 * @param lastName The last name of the guest user.
	 * @returns An Observable that emits the newly created User object.
	 */
	createGuestUser(firstName: string, lastName: string): Observable<User> {
		return this.httpClient.post<User>(this.env.apiUrl + '/guests', {
			firstName,
			lastName,
		});
	}

	/**
	 * Edits a guest user with the given ID, updating their first and last name.
	 * @param id The ID of the guest user to edit.
	 * @param firstName The updated first name for the guest user.
	 * @param lastName The updated last name for the guest user.
	 * @returns An Observable that emits the updated User object.
	 */
	editGuestUser(id: string, firstName: string, lastName: string): Observable<User> {
		return this.httpClient.put<User>(this.env.apiUrl + `/guests/${id}`, {
			firstName,
			lastName,
		});
	}

	/**
	 * Deletes a guest user with the specified ID.
	 * @param id The ID of the guest user to delete.
	 * @returns An Observable that resolves when the guest user has been deleted.
	 */
	deleteGuestUser(id: string): Observable<void> {
		return this.httpClient.delete<void>(this.env.apiUrl + `/guests/${id}`);
	}
}
