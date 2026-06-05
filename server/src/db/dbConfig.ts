import { pool } from "../db.ts";
import { parseCurrencies } from "../parsers/parseConfigs.ts";
import { PudError } from "../types/errors.ts";
import { PUD151 } from "../types/errorCodes.ts";

/**
 * DB interface: Get all supported currencies
 * @returns List of all supported currencies
 */
export const getCurrencies = async () => {
  const query = {
    text: "SELECT * FROM get_currencies();"
  };
  const currencies = await pool.query(query)
    .then(data => {
      return parseCurrencies(data.rows);
    })
    .catch(err => {
      throw new PudError(PUD151, err);
    });

  return currencies;
};
