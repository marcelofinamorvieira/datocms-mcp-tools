/**
 * @file listLocalesHandler.ts
 * @description Handler for listing all locales in a DatoCMS project
 * 
 * NOTE: Locales in DatoCMS are not separate entities - they are a property
 * of the Site object. This handler retrieves the site and returns its locales array.
 */

import { z } from "zod";
import { Client } from "@datocms/cma-client-node";
import { createListHandler, DatoCMSClient, RequestContext } from "../../../../utils/enhancedHandlerFactory.js";
import { localeSchemas } from "../../schemas.js";

// Type for the list parameters
type ListLocalesParams = z.infer<typeof localeSchemas.list>;

// Simple type for locale response since there's no SiteLocale entity
interface LocaleInfo {
  code: string;
  name: string; // We'll use the code as the name since DatoCMS doesn't store locale names
}

/**
 * Handler to list all locales in a DatoCMS project
 */
export const listLocalesHandler = createListHandler<
  ListLocalesParams,
  LocaleInfo
>({
  domain: "locales",
  schemaName: "list",
  schema: localeSchemas.list,
  entityName: "Locale",
  clientAction: async (
    client: DatoCMSClient, 
    _params: ListLocalesParams,
    _context: RequestContext
  ): Promise<LocaleInfo[]> => {
    // Cast to the specific client type we need
    const typedClient = client as Client;
    
    // Get the site to access its locales
    const site = await typedClient.site.find();
    
    // Convert locale codes to LocaleInfo objects
    return site.locales.map(code => ({
      code,
      name: code // Use code as name since DatoCMS doesn't store locale names
    }));
  }
});