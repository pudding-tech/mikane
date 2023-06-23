import { APIKey } from "../types/types";
import { APIKeyDB } from "../types/typesDB";

/**
 * Build array of API keys 
 * @param keysInput 
 * @returns List of API keys
 */
export const parseApiKeys = (keysInput: APIKeyDB[]) => {
  const keys: APIKey[] = [];
  for (const key of keysInput) {
    keys.push({
      apiKeyId: key.api_key_id,
      name: key.name,
      hashedKey: key.hashed_key,
      master: key.master,
      validFrom: key.valid_from ? key.valid_from : undefined,
      validTo: key.valid_to ? key.valid_to : undefined
    });
  }
  return keys;
};
