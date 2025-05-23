/**
 * @file cancelScheduledUnpublicationHandler.ts
 * @description Handler for canceling a scheduled unpublication for a DatoCMS record
 * Extracted from the DestroyScheduledUnpublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled unpublication for a DatoCMS record
 */
export const cancelScheduledUnpublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "cancel_scheduled_unpublication",
  schema: recordsSchemas.cancel_scheduled_unpublication,
}, async (args: any) => {
  const { apiToken, environment, itemId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Cancel the scheduled unpublication
  await client.scheduledUnpublishing.destroy(itemId);
  
  // Return success response
  const result = `Successfully cancelled scheduled unpublication for item with ID '${itemId}'.`;
  return createResponse(result);
});
