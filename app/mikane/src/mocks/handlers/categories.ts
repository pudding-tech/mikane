import { http, HttpResponse } from 'msw';
import { Category } from '../../app/services/category/category.service';
import { db } from '../db';

export const categoryHandlers = [
	http.get('/api/categories', () => HttpResponse.json(db.categories)),
	http.post('/api/categories', async ({ request }) => {
		const body = (await request.json()) as Pick<Category, 'name' | 'icon' | 'weighted'>;
		const created = {
			id: crypto.randomUUID(),
			...body,
			created: new Date().toISOString(),
			numberOfExpenses: 0,
			users: [] as (typeof db.categories)[number]['users'],
		};
		db.categories.push(created);
		return HttpResponse.json(created);
	}),
	http.put('/api/categories/:categoryId', async ({ params, request }) => {
		const body = (await request.json()) as Pick<Category, 'name' | 'icon'>;
		const idx = db.categories.findIndex((c) => c.id === params['categoryId']);
		if (idx >= 0) db.categories[idx] = { ...db.categories[idx], ...body };
		return HttpResponse.json(db.categories[idx]);
	}),
	http.post('/api/categories/:categoryId/user/:userId', async ({ params, request }) => {
		const body = (await request.json()) as { weight: number };
		const idx = db.categories.findIndex((c) => c.id === params['categoryId']);
		const category = db.categories[idx];
		const user = db.users.find((u) => u.id === params['userId']);

		if (!category) {
			return new HttpResponse(null, { status: 404 });
		}
		if (!user) {
			return new HttpResponse(null, { status: 404 });
		}
		category.users.push({ ...user, weight: body.weight });
		db.categories[idx] = { ...db.categories[idx], ...category };
		return HttpResponse.json(category);
	}),
	http.delete('/api/categories/:categoryId/user/:userId', ({ params }) => {
		const idx = db.categories.findIndex((c) => c.id === params['categoryId']);
		const category = db.categories[idx];
		const userIdx = category?.users.findIndex((u) => u.id === params['userId']);
		if (!category) {
			return new HttpResponse(null, { status: 404 });
		}
		if (userIdx === undefined || userIdx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		category!.users.splice(userIdx, 1);
		db.categories[idx] = { ...db.categories[idx], ...category };
		return HttpResponse.json(category);
	}),
	http.put('/api/categories/:categoryId/user/:userId', async ({ params, request }) => {
		const body = (await request.json()) as { weight: number };
		const idx = db.categories.findIndex((c) => c.id === params['categoryId']);
		const category = db.categories[idx];
		const userIdx = category?.users.findIndex((u) => u.id === params['userId']);
		if (!category) {
			return new HttpResponse(null, { status: 404 });
		}
		if (userIdx === undefined || userIdx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		category!.users[userIdx] = { ...category!.users[userIdx], weight: body.weight };
		db.categories[idx] = { ...db.categories[idx], ...category };
		return HttpResponse.json(category);
	}),
	http.put('/api/categories/:categoryId/weighted', async ({ params, request }) => {
		const body = (await request.json()) as { weighted: boolean };
		const idx = db.categories.findIndex((c) => c.id === params['categoryId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.categories[idx] = { ...db.categories[idx], weighted: body.weighted };
		return HttpResponse.json(db.categories[idx]);
	}),
	http.delete('/api/categories/:categoryId', ({ params }) => {
		const idx = db.categories.findIndex((c) => c.id === params['categoryId']);
		if (idx < 0) {
			return new HttpResponse(null, { status: 404 });
		}
		db.categories.splice(idx, 1);
		return HttpResponse.json(db.categories);
	}),
];
