/**
 * @file createLocaleHandler.ts
 * @description Handler for creating a new locale
 * 
 * NOTE: Locales in DatoCMS are not separate entities - they are managed
 * by updating the Site's locales array.
 */

import { z } from "zod";
import { Client } from "@datocms/cma-client-node";
import { createCreateHandler, DatoCMSClient, RequestContext } from "../../../../utils/enhancedHandlerFactory.js";
import { localeSchemas } from "../../schemas.js";

// Type for the creation parameters
type CreateLocaleParams = z.infer<typeof localeSchemas.create>;

// Response type for created locale
interface CreatedLocaleResponse {
  code: string;
  name: string;
  added: boolean;
}

/**
 * Handler to add a new locale to a DatoCMS project
 */
export const createLocaleHandler = createCreateHandler<
  CreateLocaleParams,
  CreatedLocaleResponse
>({
  domain: "locales",
  schemaName: "create",
  schema: localeSchemas.create,
  entityName: "Locale",
  successMessage: (result: CreatedLocaleResponse) => 
    `Locale '${result.name}' (${result.code}) added successfully`,
  clientAction: async (
    client: DatoCMSClient, 
    args: CreateLocaleParams,
    _context: RequestContext
  ): Promise<CreatedLocaleResponse> => {
    const { name, code } = args;
    // Note: fallback_locale is not supported in DatoCMS locale management

    // Validate locale code format
    if (!code.match(/^[a-z]{2}(-[A-Z]{2})?(-[A-Za-z]{4})?$/)) {
      throw new Error(
        "Invalid locale code format. Must be in format: xx, xx-XX, or xx-Xxxx (e.g., en, en-US, zh-Hans)"
      );
    }

    // Cast to the specific client type we need
    const typedClient = client as Client;
    
    // Get current site
    const site = await typedClient.site.find();
    
    // Check if locale already exists
    if (site.locales.includes(code)) {
      throw new Error(`Locale ${code} already exists in this project`);
    }
    
    // Add the new locale to the existing locales
    const updatedLocales = [...site.locales, code];
    
    // Ensure we have at least one locale (which we always will after adding)
    if (updatedLocales.length === 0) {
      throw new Error("Cannot have zero locales");
    }
    
    // Update the site with the new locales array
    await typedClient.site.update({
      locales: updatedLocales as [string, ...string[]]
    });
    
    return {
      code,
      name: name || code, // Use provided name or fallback to code
      added: true
    };
  }
});