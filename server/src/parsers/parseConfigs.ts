import { Currency } from "../types/types.ts";
import { CurrencyDB } from "../types/typesDB.ts";

/**
 * Build array of Currency objects
 * @param currenciesInput List of CurrencyDB objects
 * @returns List of Currency objects
 */
export const parseCurrencies = (currenciesInput: CurrencyDB[]) => {
  const currencies: Currency[] = [];
  for (const currencyObj of currenciesInput) {
    const currency: Currency = {
      code: currencyObj.code,
      name: currencyObj.name,
      formatLocale: currencyObj.format_locale
    };
    currencies.push(currency);
  }

  return currencies;
};
