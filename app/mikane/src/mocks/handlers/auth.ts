import { http, HttpResponse } from 'msw';
import { CURRENT_USER } from '../db';

export const authHandlers = [
	http.get('/api/login', () => HttpResponse.json(CURRENT_USER)),
	http.post('/api/login', () => HttpResponse.json(CURRENT_USER)),
	http.post('/api/logout', () => new HttpResponse(null, { status: 204 })),
	http.post('/api/requestpasswordreset', () => new HttpResponse(null, { status: 204 })),
	http.post('/api/resetpassword', () => new HttpResponse(null, { status: 204 })),
];
