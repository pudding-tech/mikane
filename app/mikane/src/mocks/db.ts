import balances from './fixtures/balances.json';
import categories from './fixtures/categories.json';
import events from './fixtures/events.json';
import expenses from './fixtures/expenses.json';
import guests from './fixtures/guests.json';
import payments from './fixtures/payments.json';
import users from './fixtures/users.json';

// Deep-clone on load so mutations during a session don't leak across hot reloads
export const db = structuredClone({
	events,
	users,
	expenses,
	categories,
	payments,
	guests,
	balances,
});

export const CURRENT_USER = {
	authenticated: true,
	csrfToken: 'mock-csrf-token',
	id: users[0].id,
	username: users[0].username ?? 'mockuser',
	name: users[0].name ?? 'Mock User',
	avatarURL: users[0].avatarURL ?? 'https://example.com/avatars/mockuser.png',
	superAdmin: true,
};
