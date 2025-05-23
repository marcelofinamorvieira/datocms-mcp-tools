/**
 * @file cancelScheduledPublicationHandler.ts
 * @description Handler for canceling a scheduled publication for a DatoCMS record
 * Extracted from the DestroyScheduledPublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled publication for a DatoCMS record
 */
export const cancelScheduledPublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "cancel_scheduled_publication",
  schema: recordsSchemas.cancel_scheduled_publication,
}, async (args: any) => {
  const { apiToken, environment, itemId } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Cancel the scheduled publication
  await client.scheduledPublication.destroy(itemId);
  
  // Return success response
  const result = `Successfully cancelled scheduled publication for item with ID '${itemId}'.`;
  return createResponse(result);
});
