/**
 * @file listFieldsetsHandler.ts
 * @description Handler for listing fieldsets, with optional filtering by item type
 */

import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to list fieldsets, with optional filtering by item type
 */
export const listFieldsetsHandler = createListHandler({
  domain: "schema.fieldset",
  schemaName: "list_fieldsets",
  schema: schemaSchemas.list_fieldsets,
  entityName: "Fieldset",
  clientAction: async (client, args) => {
    // Build query parameters with item type filter
    const queryParams: Record<string, unknown> = {
      "filter[item_type]": args.itemTypeId
    };
    
    // Add pagination if provided
    if (args.page) {
      queryParams.page = args.page;
    }
    
    // List fieldsets with filtering
    return await client.fieldsets.list(queryParams as any);
  }
});