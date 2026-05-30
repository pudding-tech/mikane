import { http, HttpResponse } from 'msw';
import { db } from '../db';

export const guestHandlers = [
	http.get('/api/guests', () => HttpResponse.json(db.guests)),
	http.post('/api/guests', async ({ request }) => {
		const body = (await request.json()) as Omit<(typeof db.guests)[number], 'id' | 'joined'>;
		const created = {
			id: crypto.randomUUID(),
			...body,
		};
		db.guests.push(created);
		return HttpResponse.json(created);
	}),
	http.put('/api/guests/:guestId', async ({ params, request }) => {
		const body = (await request.json()) as Omit<(typeof db.guests)[number], 'id' | 'joined'>;
		const idx = db.guests.findIndex((g) => g.id === params['guestId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.guests[idx] = { ...db.guests[idx], ...body };
		return HttpResponse.json(db.guests[idx]);
	}),
	http.delete('/api/guests/:guestId', ({ params }) => {
		const idx = db.guests.findIndex((g) => g.id === params['guestId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.guests.splice(idx, 1);
		return new HttpResponse(null, { status: 204 });
	}),
];
