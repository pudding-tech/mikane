import { http, HttpResponse } from 'msw';

export const notificationHandlers = [
	http.post('/api/notifications/:eventId/settle', ({ params }) => {
		const eventId = params['eventId'];
		// eslint-disable-next-line no-console
		console.log(`Sending ready to settle emails for event ${eventId}`);
		return new HttpResponse(null, { status: 204 });
	}),
	http.post('/api/notifications/:eventId/reminder', async ({ params, request }) => {
		const eventId = params['eventId'];
		const body = (await request.json()) as { cutoffDate?: string };
		// eslint-disable-next-line no-console
		console.log(`Sending add expenses reminder emails for event ${eventId} with cutoff date ${body.cutoffDate}`);
		return new HttpResponse(null, { status: 204 });
	}),
];
