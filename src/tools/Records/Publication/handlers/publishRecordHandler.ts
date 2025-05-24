/**
 * @file publishRecordHandler.ts
 * @description Handler for publishing a DatoCMS record
 * Extracted from the PublishDatoCMSRecord tool
 */

import { createUpdateHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

// Define proper params that extend BaseParams
interface PublishRecordParams extends BaseParams {
  itemId: string;
  content_in_locales?: string[];
  non_localized_content?: boolean;
  recursive?: boolean;
}

/**
 * Handler function for publishing a DatoCMS record
 */
export const publishRecordHandler = createUpdateHandler<PublishRecordParams, SimpleSchemaTypes.Item>({
  domain: "records",
  schemaName: "publish",
  schema: recordsSchemas.publish,
  entityName: "Record",
  idParam: "itemId",
  clientAction: async (client, args) => {
    const { itemId, content_in_locales, non_localized_content } = args;
    
    // Determine publishing mode based on provided parameters
    if (content_in_locales || non_localized_content !== undefined) {
      // Selective publishing with specified parameters
      // The DatoCMS API requires both properties to be present for selective publishing
      const publishOptions: SimpleSchemaTypes.ItemPublishSchema = {
        type: "selective_publish_operation",
        content_in_locales: content_in_locales || [],
        non_localized_content: non_localized_content ?? false
      };
      
      return await client.items.publish(itemId, publishOptions);
    } else {
      // Publish entire record (all locales & non-localized content)
      return await client.items.publish(itemId);
    }
  },
  successMessage: (item) => `Successfully published record '${item.id}'`
});