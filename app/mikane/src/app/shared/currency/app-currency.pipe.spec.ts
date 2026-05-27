import { describe, expect, it } from 'vitest';
import { AppCurrencyPipe } from './app-currency.pipe';

describe('AppCurrencyPipe', () => {
	const pipe = new AppCurrencyPipe();

	it('should create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('should format amount with provided currency code', () => {
		const result = pipe.transform(1234.56, 'USD');

		expect(result).toContain('$');
		expect(result).toContain('.56');
	});

	it('should allow explicit locale override', () => {
		const result = pipe.transform(1234.56, 'USD', 'nb-NO');

		expect(result).toContain(',56');
		expect(result).toContain('$');
	});

	it('should default to EUR when currency code is missing', () => {
		const result = pipe.transform(1234.56, undefined);

		expect(result).toContain('€');
	});

	it('should return empty string for invalid amounts', () => {
		expect(pipe.transform(null, 'NOK')).toBe('');
		expect(pipe.transform('invalid', 'NOK')).toBe('');
	});
});
