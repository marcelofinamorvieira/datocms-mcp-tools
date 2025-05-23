/**
 * @file scheduleUnpublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record unpublication
 * Extracted from the CreateScheduledUnpublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for scheduling a DatoCMS record unpublication
 */
export const scheduleUnpublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "schedule_unpublication",
  schema: recordsSchemas.schedule_unpublication,
  entityName: "Scheduled Unpublication",
  clientAction: async (client, args) => {
    const { itemId, unpublishing_scheduled_at: unpublicationDate } = args;
    
    // Create the scheduled unpublication
    const scheduledUnpublication = await client.scheduledUnpublishing.create(
      itemId,
      {
        unpublishing_scheduled_at: unpublicationDate
      }
    );
    
    return {
      message: "Successfully scheduled the item for unpublication.",
      scheduledUnpublication
    };
  }
});
