/**
 * @file getLocaleHandler.ts
 * @description Handler for retrieving a specific locale
 * 
 * NOTE: Locales in DatoCMS are managed as part of the Site object.
 * The "localeId" is actually the locale code (e.g., "en", "es").
 */

import { z } from "zod";
import { Client } from "@datocms/cma-client-node";
import { createRetrieveHandler, DatoCMSClient, RequestContext } from "../../../../utils/enhancedHandlerFactory.js";
import { localeSchemas } from "../../schemas.js";

// Type for the get parameters
type GetLocaleParams = z.infer<typeof localeSchemas.get>;

// Response type for locale info
interface LocaleInfo {
  code: string;
  name: string;
  exists: boolean;
  isPrimary: boolean;
}

/**
 * Handler to retrieve information about a specific locale
 */
export const getLocaleHandler = createRetrieveHandler<
  GetLocaleParams,
  LocaleInfo
>({
  domain: "locales",
  schemaName: "get",
  schema: localeSchemas.get,
  entityName: "Locale",
  idParam: "localeId",
  clientAction: async (
    client: DatoCMSClient, 
    params: GetLocaleParams,
    _context: RequestContext
  ): Promise<LocaleInfo> => {
    const { localeId: localeCode } = params; // localeId is actually the locale code
    
    // Cast to the specific client type we need
    const typedClient = client as Client;
    
    // Get the site to check its locales
    const site = await typedClient.site.find();
    
    // Check if locale exists
    const exists = site.locales.includes(localeCode);
    
    if (!exists) {
      throw new Error(`Locale ${localeCode} not found in this project`);
    }
    
    return {
      code: localeCode,
      name: localeCode, // DatoCMS doesn't store locale names
      exists: true,
      isPrimary: site.locales[0] === localeCode
    };
  }
});