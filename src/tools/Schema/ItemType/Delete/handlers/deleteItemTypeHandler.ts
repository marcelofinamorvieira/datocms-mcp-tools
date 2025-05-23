/**
 * @file deleteItemTypeHandler.ts
 * @description Handler for deleting DatoCMS Item Types
 */

import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { schemaSchemas } from "../../../schemas.js";

/**
 * Handler to delete an Item Type from DatoCMS
 */
export const deleteItemTypeHandler = createDeleteHandler({
  domain: "schema",
  schemaName: "delete_item_type",
  schema: schemaSchemas.delete_item_type,
  entityName: "ItemType",
  idParam: "itemTypeId",
  clientAction: async (client, args) => {
    await client.itemTypes.destroy(args.itemTypeId);
  }
});