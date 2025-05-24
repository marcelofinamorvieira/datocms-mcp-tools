/**
 * @file deleteLocaleHandler.ts
 * @description Handler for deleting a locale
 * 
 * NOTE: Locales in DatoCMS are managed by updating the Site's locales array.
 * The "localeId" is actually the locale code (e.g., "en", "es").
 */

import { z } from "zod";
import { Client } from "@datocms/cma-client-node";
import { createDeleteHandler, DatoCMSClient, RequestContext } from "../../../../utils/enhancedHandlerFactory.js";
import { localeSchemas } from "../../schemas.js";

// Type for the delete parameters
type DeleteLocaleParams = z.infer<typeof localeSchemas.delete>;

/**
 * Handler to remove a locale from a DatoCMS project
 * Note: You cannot delete the primary locale (first in array) or the only locale
 */
export const deleteLocaleHandler = createDeleteHandler<DeleteLocaleParams>({
  domain: "locales",
  schemaName: "delete",
  schema: localeSchemas.delete,
  entityName: "Locale",
  idParam: "localeId",
  successMessage: (localeCode: string | number) => 
    `Locale '${localeCode}' removed successfully`,
  clientAction: async (
    client: DatoCMSClient, 
    args: DeleteLocaleParams,
    _context: RequestContext
  ): Promise<void> => {
    const { localeId: localeCode } = args; // localeId is actually the locale code

    // Cast to the specific client type we need
    const typedClient = client as Client;
    
    // Get current site
    const site = await typedClient.site.find();
    
    // Check if locale exists
    if (!site.locales.includes(localeCode)) {
      throw new Error(`Locale ${localeCode} does not exist in this project`);
    }
    
    // Cannot delete if it's the only locale
    if (site.locales.length === 1) {
      throw new Error('Cannot delete the only locale. Projects must have at least one locale.');
    }
    
    // Cannot delete the first locale (primary locale)
    if (site.locales[0] === localeCode) {
      throw new Error(
        'Cannot delete the primary locale. The first locale in the array is the primary locale.'
      );
    }
    
    // Remove the locale from the array
    const updatedLocales = site.locales.filter(code => code !== localeCode);
    
    // Ensure we have at least one locale
    if (updatedLocales.length === 0) {
      throw new Error("Cannot delete all locales. At least one locale must remain.");
    }
    
    // Update the site with the new locales array
    await typedClient.site.update({
      locales: updatedLocales as [string, ...string[]]
    });
  }
});