/**
 * @file updateLocaleHandler.ts
 * @description Handler for updating an existing locale
 * 
 * NOTE: DatoCMS does not support updating locale properties.
 * Locales are just strings in the site's locales array.
 * This handler exists for API compatibility but will always throw an error.
 */

import { z } from "zod";
import { createUpdateHandler, DatoCMSClient, RequestContext } from "../../../../utils/enhancedHandlerFactory.js";
import { localeSchemas } from "../../schemas.js";

// Type for the update parameters
type UpdateLocaleParams = z.infer<typeof localeSchemas.update>;

// Response type 
interface UpdateLocaleResponse {
  error: string;
}

/**
 * Handler to update an existing locale (NOT SUPPORTED)
 */
export const updateLocaleHandler = createUpdateHandler<
  UpdateLocaleParams,
  UpdateLocaleResponse
>({
  domain: "locales",
  schemaName: "update",
  schema: localeSchemas.update,
  entityName: "Locale",
  idParam: "localeId",
  successMessage: () => 
    `Locale update operation completed`,
  clientAction: async (
    _client: DatoCMSClient, 
    args: UpdateLocaleParams,
    _context: RequestContext
  ): Promise<UpdateLocaleResponse> => {
    const { localeId } = args;

    // DatoCMS doesn't support updating locale properties
    // Locales are just strings in an array with no additional properties
    throw new Error(
      `Cannot update locale '${localeId}'. ` +
      `DatoCMS locales are simple strings (e.g., "en", "es") without additional properties like names or fallback locales. ` +
      `To change the order of locales, you need to update the entire site.locales array.`
    );
  }
});