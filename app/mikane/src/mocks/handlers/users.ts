import { http, HttpResponse } from 'msw';
import { CURRENT_USER, db } from '../db';

export const userHandlers = [
	http.get('/api/users', ({ request }) => {
		const url = new URL(request.url);
		const excludeSelf = url.searchParams.get('excludeSelf') === 'true';
		const users = excludeSelf ? db.users.filter((u) => u.id !== CURRENT_USER.id) : db.users;
		const guests = db.guests;
		const excludeGuests = url.searchParams.get('excludeGuests') === 'true';
		if (excludeGuests) {
			return HttpResponse.json(users);
		}
		return HttpResponse.json([...users, ...guests]);
	}),
	http.get('/api/users/balances', ({ request }) => {
		const url = new URL(request.url);
		const eventId = url.searchParams.get('eventId');
		if (!eventId) return HttpResponse.json([]);
		const balances = db.balances.filter((b) => b.user.eventInfo?.id === eventId);
		return HttpResponse.json(balances);
	}),
	http.get('/api/users/username/:usernameId', ({ params }) => {
		const user = db.users.find((u) => u.username === params['usernameId']) ?? db.users.find((u) => u.id === params['usernameId']);
		return HttpResponse.json(user);
	}),
	http.get('/api/users/:userId', ({ params }) => {
		const user = db.users.find((u) => u.id === params['userId']);
		if (!user) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(user);
	}),
	http.post('/api/users', async ({ request }) => {
		const body = (await request.json()) as Omit<(typeof db.users)[number], 'id' | 'created'> & { eventId: string };
		const created = {
			id: crypto.randomUUID(),
			name: body.name,
			username: body.username,
			guest: false,
			avatarURL: body.avatarURL,
			created: new Date().toISOString(),
			eventInfo: {
				id: body.eventId,
				isAdmin: false,
				joinedTime: new Date().toISOString(),
			},
		};
		db.users.push(created);
		return HttpResponse.json(created);
	}),
	http.get('/api/users/:userId/events', ({ params }) => {
		const user = db.users.find((u) => u.id === params['userId']);
		if (!user) return HttpResponse.json([]);
		const events = db.events;
		return HttpResponse.json(events);
	}),
	http.get('/api/users/:userId/expenses', ({ params }) => {
		const user = db.users.find((u) => u.id === params['userId']);
		if (!user) return HttpResponse.json([]);
		const expenses = db.expenses.filter((e) => e.payer.id === user.id);
		return HttpResponse.json(expenses);
	}),
	http.put('/api/users/:userId', async ({ params, request }) => {
		const body = (await request.json()) as Partial<Omit<(typeof db.users)[number], 'id' | 'created' | 'guest' | 'eventInfo'>>;
		const idx = db.users.findIndex((u) => u.id === params['userId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		const updatedUser = { ...db.users[idx], ...body } as (typeof db.users)[number];
		db.users[idx] = updatedUser;
		return HttpResponse.json(db.users[idx]);
	}),
	http.put('/api/users/:userId/preferences', async ({ params, request }) => {
		const body = (await request.json()) as { publicEmail: boolean; publicPhone: boolean };
		const idx = db.users.findIndex((u) => u.id === params['userId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		const updatedUser = { ...db.users[idx], ...body } as (typeof db.users)[number];
		db.users[idx] = updatedUser;
		return HttpResponse.json(db.users[idx]);
	}),
	http.delete('/api/users/:userId', ({ params }) => {
		const idx = db.users.findIndex((u) => u.id === params['userId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.users.splice(idx, 1);
		return new HttpResponse(null, { status: 204 });
	}),
	http.post('/api/users/changepassword', async () => {
		// In a real implementation, you would verify the current password and update it to the new password.
		// For this mock, we will just return the current user without actually changing the password.
		const user = db.users.find((u) => u.id === CURRENT_USER.id);
		return HttpResponse.json(user);
	}),
	http.post('/api/users/invite', async () => {
		// In a real implementation, you would send an invitation email to the provided email address.
		// For this mock, we will just return a success response without actually sending an email.
		return new HttpResponse(null, { status: 204 });
	}),
	http.post('/api/users/requestdeleteaccount', async () => {
		// In a real implementation, you would handle the account deletion request, possibly by sending an email to the user or marking the account for deletion.
		// For this mock, we will just return a success response without actually deleting the account.
		return new HttpResponse(null, { status: 204 });
	}),
];
