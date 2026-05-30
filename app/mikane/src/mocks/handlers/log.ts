import { http, HttpResponse } from 'msw';

export const logHandlers = [http.post('/api/log', () => new HttpResponse(null, { status: 204 }))];
