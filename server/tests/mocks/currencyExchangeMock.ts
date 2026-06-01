import { vi } from "vitest";

export const STATIC_EXCHANGE_RATES: Record<string, number> = {
  "EUR|NOK": 10,
  "USD|NOK": 5
};

export const mockCurrencyExchangeFetch = () => {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const url = new URL(input.toString());
    const pathParts = url.pathname.split("/");
    const from = pathParts[pathParts.length - 2];
    const to = pathParts[pathParts.length - 1];
    const rate = STATIC_EXCHANGE_RATES[`${from}|${to}`] ?? 1;

    return {
      ok: true,
      json: async () => ({
        date: "2026-06-05",
        base: from,
        quote: to,
        rate: rate
      })
    } as Response;
  });
};
