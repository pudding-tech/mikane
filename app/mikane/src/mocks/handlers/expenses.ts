import { http, HttpResponse } from 'msw';
import { db } from '../db';

export const expenseHandlers = [
	http.get('/api/expenses', () => HttpResponse.json(db.expenses)),
	http.get('/api/expenses/:expenseId', ({ params }) => {
		const expense = db.expenses.find((e) => e.id === params['expenseId']);
		if (!expense) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(expense);
	}),
	http.post('/api/expenses', async ({ request }) => {
		const body = (await request.json()) as Omit<(typeof db.expenses)[number], 'id' | 'created'>;
		const created = {
			id: crypto.randomUUID(),
			...body,
			created: new Date().toISOString(),
		};
		db.expenses.push(created);
		return HttpResponse.json(created);
	}),
	http.put('/api/expenses/:expenseId', async ({ params, request }) => {
		const body = (await request.json()) as Omit<(typeof db.expenses)[number], 'id' | 'created'>;
		const idx = db.expenses.findIndex((e) => e.id === params['expenseId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.expenses[idx] = { ...db.expenses[idx], ...body, created: new Date(db.expenses[idx].created).toISOString() };
		return HttpResponse.json(db.expenses[idx]);
	}),
	http.delete('/api/expenses/:expenseId', ({ params }) => {
		const idx = db.expenses.findIndex((e) => e.id === params['expenseId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.expenses.splice(idx, 1);
		return new HttpResponse(null, { status: 204 });
	}),
];
