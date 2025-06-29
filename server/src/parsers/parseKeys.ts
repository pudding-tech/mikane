import { APIKey } from "../types/types.ts";
import { APIKeyDB } from "../types/typesDB.ts";

/**
 * Build array of API keys 
 * @param keysInput 
 * @returns List of API keys
 */
export const parseApiKeys = (keysInput: APIKeyDB[]) => {
  const keys: APIKey[] = [];
  for (const key of keysInput) {
    keys.push({
      apiKeyId: key.id,
      name: key.name,
      hashedKey: key.hashed_key,
      master: key.master,
      validFrom: key.valid_from ? key.valid_from : undefined,
      validTo: key.valid_to ? key.valid_to : undefined
    });
  }
  return keys;
};
