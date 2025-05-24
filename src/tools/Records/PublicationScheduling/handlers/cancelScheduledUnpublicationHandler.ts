/**
 * @file cancelScheduledUnpublicationHandler.ts
 * @description Handler for canceling a scheduled unpublication for a DatoCMS record
 * Extracted from the DestroyScheduledUnpublicationOnRecord tool
 */

import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled unpublication for a DatoCMS record
 */
export const cancelScheduledUnpublicationHandler = createDeleteHandler({
  domain: "records",
  schemaName: "cancel_scheduled_unpublication",
  schema: recordsSchemas.cancel_scheduled_unpublication,
  entityName: "Scheduled Unpublication",
  idParam: "itemId",
  clientAction: async (client, args) => {
    await client.scheduledUnpublishing.destroy(args.itemId);
  },
  successMessage: (itemId) => `Successfully canceled scheduled unpublication for record '${itemId}'`
});
