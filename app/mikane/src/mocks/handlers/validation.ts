import { http, HttpResponse } from 'msw';

export const validationHandlers = [
	http.post('/api/validation/user/username', async ({ request }) => {
		const body = (await request.json()) as { username: string; userId?: string };
		const isValid = body.username !== 'existinguser';
		return HttpResponse.json({ valid: isValid });
	}),
	http.post('/api/validation/user/email', async ({ request }) => {
		const body = (await request.json()) as { email: string; userId?: string };
		const isValid = body.email !== 'existingemail@example.com';
		return HttpResponse.json({ valid: isValid });
	}),
	http.post('/api/validation/user/phone', async ({ request }) => {
		const body = (await request.json()) as { phone: string; userId?: string };
		const isValid = body.phone !== '1234567890';
		return HttpResponse.json({ valid: isValid });
	}),
	http.post('/api/validation/event/name', async ({ request }) => {
		const body = (await request.json()) as { name: string; eventId?: string };
		const isValid = body.name !== 'Existing Event';
		return HttpResponse.json({ valid: isValid });
	}),
	http.post('/api/validation/category/name', async ({ request }) => {
		const body = (await request.json()) as { name: string; eventId: string; categoryId?: string };
		const isValid = body.name !== 'Existing Category';
		return HttpResponse.json({ valid: isValid });
	}),
];
