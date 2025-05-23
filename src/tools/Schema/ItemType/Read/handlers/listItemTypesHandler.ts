/**
 * @file listItemTypesHandler.ts
 * @description Handler for listing all item types in a DatoCMS project
 */

import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to list all Item Types in a DatoCMS project
 */
export const listItemTypesHandler = createListHandler({
  domain: "schema",
  schemaName: "list_item_types",
  schema: schemaSchemas.list_item_types,
  entityName: "ItemType",
  clientAction: async (client) => {
    return await client.itemTypes.list();
  }
});