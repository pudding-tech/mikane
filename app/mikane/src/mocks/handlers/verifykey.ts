import { http, HttpResponse } from 'msw';

export const verifyKeyHandlers = [
	http.get('/api/verifykey/register/:registerKey', ({ params }) => {
		const registerKey = params['registerKey'];
		if (registerKey === 'valid-register-key') {
			return new HttpResponse(null, { status: 204 });
		} else {
			return new HttpResponse(null, { status: 404 });
		}
	}),
	http.get('/api/verifykey/deleteaccount/:deleteAccountKey', ({ params }) => {
		const deleteAccountKey = params['deleteAccountKey'];
		if (deleteAccountKey === 'valid-delete-account-key') {
			return new HttpResponse(null, { status: 204 });
		} else {
			return new HttpResponse(null, { status: 404 });
		}
	}),
	http.get('/api/verifykey/passwordreset/:passwordResetKey', ({ params }) => {
		const passwordResetKey = params['passwordResetKey'];
		if (passwordResetKey === 'valid-password-reset-key') {
			return new HttpResponse(null, { status: 204 });
		} else {
			return new HttpResponse(null, { status: 404 });
		}
	}),
];
