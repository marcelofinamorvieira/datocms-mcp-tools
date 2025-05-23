/**
 * @file scheduleUnpublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record unpublication
 * Extracted from the CreateScheduledUnpublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for scheduling a DatoCMS record unpublication
 */
export const scheduleUnpublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "schedule_unpublication",
  schema: recordsSchemas.schedule_unpublication,
}, async (args: any) => {
  const { apiToken, environment, itemId, unpublishing_scheduled_at: unpublicationDate } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Create the scheduled unpublication
  const scheduledUnpublication = await client.scheduledUnpublishing.create(
    itemId,
    {
      unpublishing_scheduled_at: unpublicationDate
    }
  );
  
  const result = {
    message: "Successfully scheduled the item for unpublication.",
    scheduledUnpublication
  };
  
  return createResponse(JSON.stringify(result, null, 2));
});
