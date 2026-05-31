import { http, HttpResponse } from 'msw';

// Match the real backend's 409 error shape.
const duplicate = (code: string, message: string) => HttpResponse.json({ code, message, status: 409 }, { status: 409 });

export const validationHandlers = [
	http.post('/api/validation/user/username', async ({ request }) => {
		const body = (await request.json()) as { username: string; userId?: string };
		if (body.username === 'existinguser') {
			return duplicate('PUD-017', 'Username already taken');
		}
		return HttpResponse.json({ valid: true });
	}),
	http.post('/api/validation/user/email', async ({ request }) => {
		const body = (await request.json()) as { email: string; userId?: string };
		if (body.email === 'existingemail@example.com') {
			return duplicate('PUD-018', 'Email address already taken');
		}
		return HttpResponse.json({ valid: true });
	}),
	http.post('/api/validation/user/phone', async ({ request }) => {
		const body = (await request.json()) as { phone: string; userId?: string };
		if (body.phone === '1234567890') {
			return duplicate('PUD-019', 'Phone number already taken');
		}
		return HttpResponse.json({ valid: true });
	}),
	http.post('/api/validation/event/name', async ({ request }) => {
		const body = (await request.json()) as { name: string; eventId?: string };
		if (body.name === 'Existing Event') {
			return duplicate('PUD-005', 'Another event already has this name');
		}
		return HttpResponse.json({ valid: true });
	}),
	http.post('/api/validation/category/name', async ({ request }) => {
		const body = (await request.json()) as { name: string; eventId: string; categoryId?: string };
		if (body.name === 'Existing Category') {
			return duplicate('PUD-097', 'Another category in this event already has this name');
		}
		return HttpResponse.json({ valid: true });
	}),
];
