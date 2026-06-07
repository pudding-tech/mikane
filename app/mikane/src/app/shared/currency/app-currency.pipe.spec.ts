import { describe, expect, it } from 'vitest';
import { CurrencyCode } from '../../types/constants';
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
		expect(result).toMatch(/\$|USD/);
	});

	it('should default to EUR when currency code is missing', () => {
		const result = pipe.transform(1234.56, undefined);

		expect(result).toContain('€');
	});

	it('should return empty string for invalid amounts', () => {
		expect(pipe.transform(null, 'NOK')).toBe('');
		expect(pipe.transform('invalid', 'NOK')).toBe('');
	});

	it('should parse numeric string amounts', () => {
		const result = pipe.transform('1234.56', 'USD');

		expect(result).toContain('$');
		expect(result).toContain('.56');
	});

	it('should honour the display option', () => {
		expect(pipe.transform(1234.56, 'USD', undefined, 'code')).toContain('USD');
		expect(pipe.transform(1234.56, 'USD', undefined, 'name')).toContain('dollar');
	});

	it('should fall back to a plain number and code for a malformed currency code', () => {
		const result = pipe.transform(1234.56, 'XX' as CurrencyCode);

		expect(result).toContain('XX');
		expect(result).toMatch(/1.?234/);
	});
});
