/**
 * @file cancelScheduledUnpublicationHandler.ts
 * @description Handler for canceling a scheduled unpublication for a DatoCMS record
 * Extracted from the DestroyScheduledUnpublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled unpublication for a DatoCMS record
 */
export const cancelScheduledUnpublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "cancel_scheduled_unpublication",
  schema: recordsSchemas.cancel_scheduled_unpublication,
  entityName: "Scheduled Unpublication",
  clientAction: async (client, args) => {
    const { itemId } = args;
    
    // Cancel the scheduled unpublication
    await client.scheduledUnpublishing.destroy(itemId);
    
    // Return success response
    return `Successfully cancelled scheduled unpublication for item with ID '${itemId}'.`;
  }
});
