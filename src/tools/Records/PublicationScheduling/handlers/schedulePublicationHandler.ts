/**
 * @file schedulePublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record publication
 * Extracted from the CreateScheduledPublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for scheduling a DatoCMS record publication
 */
export const schedulePublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "schedule_publication",
  schema: recordsSchemas.schedule_publication,
  entityName: "Scheduled Publication",
  clientAction: async (client, args) => {
    const { itemId, publication_scheduled_at: publicationDate } = args;
    
    // Create the scheduled publication
    const scheduledPublication = await client.scheduledPublication.create(
      itemId,
      {
        publication_scheduled_at: publicationDate
      }
    );
    
    return {
      message: "Successfully scheduled the item for publication.",
      scheduledPublication
    };
  }
});
