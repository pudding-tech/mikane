/**
 * Formats a number as a currency string.
 * @param amount The amount to format.
 * @param currency The currency code (e.g., "EUR", "USD").
 * @param formatLocale The locale to use for formatting (e.g., "en-US", "fr-FR").
 * @param display How to display the currency (default is "code"). Options are "code", "name", "symbol", or "narrowSymbol".
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number, currency: string, formatLocale: string, display: "code" | "name" | "symbol" | "narrowSymbol" = "code") => {
  return new Intl.NumberFormat(formatLocale, {
    style: "currency",
    currency: currency,
    currencyDisplay: display
  }).format(amount);
};
