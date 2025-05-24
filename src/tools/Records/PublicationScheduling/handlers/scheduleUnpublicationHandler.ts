/**
 * @file scheduleUnpublicationHandler.ts
 * @description Handler for scheduling a DatoCMS record unpublication
 * Extracted from the CreateScheduledUnpublicationOnRecord tool
 */

import { createCreateHandler, BaseParams } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

interface ScheduleUnpublicationParams extends BaseParams {
  itemId: string;
  unpublishing_scheduled_at: string;
}

/**
 * Handler function for scheduling a DatoCMS record unpublication
 */
export const scheduleUnpublicationHandler = createCreateHandler<ScheduleUnpublicationParams, SimpleSchemaTypes.ScheduledUnpublishing>({
  domain: "records",
  schemaName: "schedule_unpublication",
  schema: recordsSchemas.schedule_unpublication,
  entityName: "Scheduled Unpublication",
  clientAction: async (client, args) => {
    const { itemId, unpublishing_scheduled_at: unpublicationDate } = args;
    
    // Create the scheduled unpublication
    return await client.scheduledUnpublishing.create(
      itemId,
      {
        unpublishing_scheduled_at: unpublicationDate
      }
    );
  },
  successMessage: (result) => `Successfully scheduled unpublication for record at ${result.unpublishing_scheduled_at}`
});
