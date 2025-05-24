/**
 * @file schedulePublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record publication
 * Extracted from the CreateScheduledPublicationOnRecord tool
 */

import { createCreateHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

interface SchedulePublicationParams extends BaseParams {
  itemId: string;
  publication_scheduled_at: string;
}

/**
 * Handler function for scheduling a DatoCMS record publication
 */
export const schedulePublicationHandler = createCreateHandler<SchedulePublicationParams, SimpleSchemaTypes.ScheduledPublication>({
  domain: "records",
  schemaName: "schedule_publication",
  schema: recordsSchemas.schedule_publication,
  entityName: "Scheduled Publication",
  clientAction: async (client, args) => {
    const { itemId, publication_scheduled_at: publicationDate } = args;
    
    // Create the scheduled publication
    return await client.scheduledPublication.create(
      itemId,
      {
        publication_scheduled_at: publicationDate
      }
    );
  },
  successMessage: (result) => `Successfully scheduled publication for record at ${result.publication_scheduled_at}`
});
