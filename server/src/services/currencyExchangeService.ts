import { PUD088 } from "../types/errorCodes.ts";
import { CurrencyExchangeServiceError, PudError } from "../types/errors.ts";
import { FrankfurterResponse, RateCacheEntry } from "../types/types.ts";
import logger from "../utils/logger.ts";

const BASE_URL = "https://api.frankfurter.dev/v2";
const HISTORICAL_RATE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const LATEST_RATE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 1000;

const rateCache = new Map<string, RateCacheEntry>();
const inFlightRateRequests = new Map<string, Promise<number>>();

/**
 * Convert an amount between currencies using Frankfurter exchange rates.
 * @param amount Amount to convert
 * @param from Base currency code (in ISO 4217 format)
 * @param to Quote currency code (in ISO 4217 format)
 * @param date Optional date. If omitted, latest rate is used.
 * @returns Converted amount
 */
export const convertCurrency = async (amount: number, from: string, to: string, date?: Date) => {
  if (!Number.isFinite(amount)) {
    throw new PudError(PUD088);
  }

  const rate = await getExchangeRate(from, to, date);
  return +((amount * rate).toFixed(2));
};

/**
 * Get currency exchange rate for one currency pair using the Frankfurter API.
 * @param from Base currency code (in ISO 4217 format)
 * @param to Quote currency code (in ISO 4217 format)
 * @param date Optional date. If omitted, latest rate is used.
 * @returns Exchange rate from base to quote currency
 */
export const getExchangeRate = async (from: string, to: string, date?: Date) => {
  const normalizedFrom = normalizeCurrency(from);
  const normalizedTo = normalizeCurrency(to);

  if (normalizedFrom === normalizedTo) {
    return 1;
  }

  const dateKey = date?.toISOString().slice(0, 10);
  const cacheKey = `${normalizedFrom}|${normalizedTo}|${dateKey ?? "latest"}`;

  // Check cache first
  const cachedRate = getCachedRate(cacheKey);
  if (cachedRate !== undefined) {
    return cachedRate;
  }

  // If there's already a request in flight for the same currency pair and date, wait for it instead of making a new request
  const inFlightRequest = inFlightRateRequests.get(cacheKey);
  if (inFlightRequest) {
    logger.debug(`Waiting for in-flight exchange rate request for ${cacheKey}`);
    return inFlightRequest;
  }

  const dateQuery = dateKey ? `?date=${dateKey}` : "";
  const url = new URL(`${BASE_URL}/rate/${normalizedFrom}/${normalizedTo}${dateQuery}`);

  const ratePromise = (async () => {
    let usedLatestFallback = false;
    let data: FrankfurterResponse;
    try {
      data = await fetchCurrencyRate(url);
    }
    catch (err) {
      if (!dateKey) {
        throw err;
      }

      // Try again without date, in case the date is out of range for the provider
      logger.warn(`Failed to fetch exchange rate with date, trying again without date: ${err}`);
      data = await fetchCurrencyRate(new URL(`${BASE_URL}/rate/${normalizedFrom}/${normalizedTo}`));
      usedLatestFallback = true;
    }

    const rate = data.rate;
    logger.debug(`Fetched exchange rate from ${data.base} to ${data.quote} (date: ${data.date}): ${rate}`);

    if (typeof rate !== "number") {
      throw new CurrencyExchangeServiceError(`Missing exchange rate from ${normalizedFrom} to ${normalizedTo}`);
    }

    // Cache the exchange rate
    enforceCacheLimit();
    const responseIsLatest = usedLatestFallback || !dateKey;
    const cacheWriteKey = responseIsLatest ? `${normalizedFrom}|${normalizedTo}|latest` : cacheKey;
    const ttl = responseIsLatest ? LATEST_RATE_TTL_MS : HISTORICAL_RATE_TTL_MS;
    rateCache.set(cacheWriteKey, { rate, expiresAt: Date.now() + ttl });

    return rate;
  })();

  inFlightRateRequests.set(cacheKey, ratePromise);

  try {
    return await ratePromise;
  }
  finally {
    inFlightRateRequests.delete(cacheKey);
  }
};

/***********/
/* PRIVATE */
/***********/

/**
 * Get a cached exchange rate if it exists and is still valid.
 * @param cacheKey The key to look up in the cache
 * @returns The cached exchange rate or undefined if not found or expired
 */
const getCachedRate = (cacheKey: string): number | undefined => {
  const cached = rateCache.get(cacheKey);
  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    rateCache.delete(cacheKey);
    return undefined;
  }

  return cached.rate;
};

/**
 * Fetch currency rate from Frankfurter API.
 * @param url URL to fetch the currency rate from
 * @returns FrankfurterResponse containing the exchange rate
 */
const fetchCurrencyRate = async (url: URL) => {
  logger.debug(`Fetching exchange rate from ${url.href}`);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  }
  catch (err) {
    throw new CurrencyExchangeServiceError(`Failed to reach exchange-rate provider: ${err}`);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new CurrencyExchangeServiceError(`Exchange-rate provider returned ${response.status}: ${errorBody || response.statusText}`, response.status);
  }

  try {
    return await response.json() as FrankfurterResponse;
  }
  catch (err) {
    throw new CurrencyExchangeServiceError(`Invalid JSON from exchange-rate provider: ${err}`);
  }
};

/**
 * Check if cache size exceeds limit and delete expired entries if necessary.
 */
const enforceCacheLimit = () => {
  if (rateCache.size < MAX_CACHE_ENTRIES) {
    return;
  }

  const now = Date.now();
  for (const [key, entry] of rateCache) {
    if (entry.expiresAt <= now) {
      rateCache.delete(key);
    }
  }

  while (rateCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = rateCache.keys().next().value;
    if (!oldestKey) {
      return;
    }

    rateCache.delete(oldestKey);
  }
};

/**
 * Normalize a currency code to ISO 4217 format.
 * @param value Currency code to normalize
 * @returns Normalized currency code
 */
const normalizeCurrency = (value: string) => {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new CurrencyExchangeServiceError(`Invalid currency code: ${value}`);
  }

  return normalized;
};
