/**
 * @file unpublishRecordHandler.ts
 * @description Handler for unpublishing a DatoCMS record
 * Extracted from the UnpublishDatoCMSRecord tool
 */

import { createUpdateHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

interface UnpublishRecordParams extends BaseParams {
  itemId: string;
  recursive?: boolean;
}

/**
 * Handler function for unpublishing a DatoCMS record
 */
export const unpublishRecordHandler = createUpdateHandler<UnpublishRecordParams, SimpleSchemaTypes.Item>({
  domain: "records",
  schemaName: "unpublish",
  schema: recordsSchemas.unpublish,
  entityName: "Record",
  idParam: "itemId",
  clientAction: async (client, args) => {
    const { itemId, recursive = false } = args;

    // The unpublish method requires specific parameters
    if (recursive) {
      // For recursive unpublishing, we need to pass content_in_locales
      const unpublishOptions: SimpleSchemaTypes.ItemUnpublishSchema = {
        type: "selective_unpublish_operation",
        content_in_locales: [] // Empty array unpublishes all locales
      };
      return await client.items.unpublish(itemId, unpublishOptions);
    } else {
      // Non-recursive unpublishing
      return await client.items.unpublish(itemId);
    }
  },
  successMessage: (item) => `Successfully unpublished record '${item.id}'`
});
