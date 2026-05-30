import { authHandlers } from './auth';
import { categoryHandlers } from './categories';
import { eventHandlers } from './events';
import { expenseHandlers } from './expenses';
import { guestHandlers } from './guests';
import { logHandlers } from './log';
import { notificationHandlers } from './notifications';
import { userHandlers } from './users';
import { validationHandlers } from './validation';
import { verifyKeyHandlers } from './verifykey';

export const handlers = [
	...authHandlers,
	...categoryHandlers,
	...eventHandlers,
	...notificationHandlers,
	...expenseHandlers,
	...guestHandlers,
	...logHandlers,
	...userHandlers,
	...validationHandlers,
	...verifyKeyHandlers,
];
