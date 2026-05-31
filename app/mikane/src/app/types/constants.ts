export interface Currency {
	code: string;
	name: string;
}
export const CURRENCIES: readonly Currency[] = [
	{ code: 'USD', name: 'US Dollar' },
	{ code: 'EUR', name: 'Euro' },
	{ code: 'GBP', name: 'British Pound' },
	{ code: 'CAD', name: 'Canadian Dollar' },
	{ code: 'AUD', name: 'Australian Dollar' },
	{ code: 'NOK', name: 'Norwegian Krone' },
	{ code: 'SEK', name: 'Swedish Krona' },
	{ code: 'DKK', name: 'Danish Krone' },
	{ code: 'JPY', name: 'Japanese Yen' },
	{ code: 'CNY', name: 'Chinese Yuan' },
	{ code: 'KRW', name: 'South Korean Won' },
	{ code: 'CHF', name: 'Swiss Franc' },
] as const satisfies readonly Currency[];
export type CurrencyCode = (typeof CURRENCIES)[number]['code'];
export const CurrencyCode = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.code])) as { readonly [K in CurrencyCode]: K };
export const CURRENCY_NAME: Record<CurrencyCode, string> = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.name]));
