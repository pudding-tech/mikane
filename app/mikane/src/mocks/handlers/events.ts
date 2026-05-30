import { http, HttpResponse } from 'msw';
import { PuddingEvent } from 'src/app/services/event/event.service';
import { CURRENT_USER, db } from '../db';

export const eventHandlers = [
	http.get('/api/events', () => HttpResponse.json(db.events)),
	http.get('/api/events/:eventId', ({ params }) => {
		const event = db.events.find((e) => e.id === params['eventId']);
		if (!event) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(event);
	}),
	http.get('/api/events/:eventId/balances', () => HttpResponse.json(db.balances)),
	http.get('/api/events/:eventId/payments', () => HttpResponse.json(db.payments)),
	http.post('/api/events', async ({ request }) => {
		const body = (await request.json()) as PuddingEvent;
		const created = {
			id: crypto.randomUUID(),
			...body,
			created: new Date().toISOString(),
			status: {
				id: 1,
				name: 'Active',
			},
			userInfo: {
				id: CURRENT_USER.id,
				isAdmin: true,
				inEvent: true,
			},
		};
		db.events.push(created);
		return HttpResponse.json(created);
	}),
	http.put('/api/events/:eventId', async ({ params, request }) => {
		const body = (await request.json()) as PuddingEvent;
		const idx = db.events.findIndex((e) => e.id === params['eventId']);

		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.events[idx] = { ...db.events[idx], ...body, created: new Date(body.created).toISOString() };
		return HttpResponse.json(db.events[idx]);
	}),
	http.delete('/api/events/:eventId', ({ params }) => {
		const idx = db.events.findIndex((e) => e.id === params['eventId']);
		if (idx >= 0) db.events.splice(idx, 1);
		return new HttpResponse(null, { status: 204 });
	}),
	http.post('/api/events/:eventId/user/:userId', ({ params }) => {
		const event = db.events.find((e) => e.id === params['eventId']);
		const user = db.users.find((u) => u.id === params['userId']);

		if (event && user) {
			db.balances.push({
				user: {
					id: user.id,
					username: user.username,
					name: user.name,
					created: user.created,
					avatarURL: user.avatarURL,
					guest: user.guest,
					eventInfo: {
						id: event.id,
						isAdmin: false,
						joinedTime: new Date().toISOString(),
					},
				},
				expensesCount: 0,
				spending: 0,
				expenses: 0,
				balance: 0,
			});
		}
		return HttpResponse.json(event);
	}),
	http.delete('/api/events/:eventId/user/:userId', ({ params }) => {
		const idx = db.balances.findIndex((b) => b.user.id === params['userId'] && b.user.eventInfo?.id === params['eventId']);
		if (idx >= 0) db.balances.splice(idx, 1);

		const categoryIdx = db.categories.findIndex((c) => c.users.some((u) => u.id === params['userId']));
		const category = db.categories[categoryIdx];
		if (category) {
			const userIdx = category.users.findIndex((u) => u.id === params['userId']);
			if (userIdx >= 0) category.users.splice(userIdx, 1);
			db.categories[categoryIdx] = { ...db.categories[categoryIdx], ...category };
		}

		return HttpResponse.json(null);
	}),
	http.post('/api/events/:eventId/admin/:userId', ({ params }) => {
		const idx = db.events.findIndex((e) => e.id === params['eventId']);
		const event = db.events[idx];
		if (event && !event.adminIds.includes(params['userId'] as string)) {
			event.adminIds.push(params['userId'] as string);
			db.events[idx] = { ...db.events[idx], ...event };
		}
		return HttpResponse.json(event);
	}),
	http.delete('/api/events/:eventId/admin/:userId', ({ params }) => {
		const idx = db.events.findIndex((e) => e.id === params['eventId']);
		const event = db.events[idx];
		if (event && event.adminIds.includes(params['userId'] as string)) {
			const adminIdx = event.adminIds.findIndex((id) => id === params['userId']);
			event.adminIds.splice(adminIdx, 1);
			db.events[idx] = { ...db.events[idx], ...event };
		}
		return HttpResponse.json(event);
	}),
];
