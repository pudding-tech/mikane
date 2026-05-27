import { Pipe, PipeTransform } from '@angular/core';

const LOCALE_BY_CURRENCY: Record<string, string> = {
	USD: 'en-US',
	EUR: 'en-GB',
	GBP: 'en-GB',
	CAD: 'en-CA',
	AUD: 'en-AU',
	NOK: 'nb-NO',
	SEK: 'sv-SE',
	DKK: 'da-DK',
	JPY: 'ja-JP',
	CNY: 'zh-CN',
	KRW: 'ko-KR',
	CHF: 'de-CH',
};

@Pipe({
	name: 'appCurrency',
	standalone: true,
})
export class AppCurrencyPipe implements PipeTransform {
	transform(
		amount: number | string | null | undefined,
		currencyCode: string | null | undefined,
		locale?: string,
		display: 'narrowSymbol' | 'symbol' | 'code' | 'name' = 'narrowSymbol',
	): string {
		if (amount === null || amount === undefined || amount === '') {
			return '';
		}

		const parsedAmount = typeof amount === 'string' ? Number(amount) : amount;
		if (!Number.isFinite(parsedAmount)) {
			return '';
		}

		const normalizedCode = (currencyCode || 'EUR').toUpperCase();
		const resolvedLocale = locale || LOCALE_BY_CURRENCY[normalizedCode] || 'en-GB';

		try {
			return new Intl.NumberFormat(resolvedLocale, {
				style: 'currency',
				currency: normalizedCode,
				currencyDisplay: display,
			}).format(parsedAmount);
		}
		catch {
			const fallbackNumber = new Intl.NumberFormat(resolvedLocale, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}).format(parsedAmount);

			return `${fallbackNumber} ${normalizedCode}`;
		}
	}
}
