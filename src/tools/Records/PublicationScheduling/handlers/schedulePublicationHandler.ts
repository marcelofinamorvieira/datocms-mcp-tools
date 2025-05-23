/**
 * @file schedulePublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record publication
 * Extracted from the CreateScheduledPublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { ClientType, UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for scheduling a DatoCMS record publication
 */
export const schedulePublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "schedule_publication",
  schema: recordsSchemas.schedule_publication,
}, async (args: any) => {
  const { apiToken, environment, itemId, publication_scheduled_at: publicationDate } = args;
  
  // Initialize client
  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  // Create the scheduled publication
  const scheduledPublication = await client.scheduledPublication.create(
    itemId,
    {
      publication_scheduled_at: publicationDate
    }
  );
  
  const result = {
    message: "Successfully scheduled the item for publication.",
    scheduledPublication
  };
  
  return createResponse(JSON.stringify(result, null, 2));
});
