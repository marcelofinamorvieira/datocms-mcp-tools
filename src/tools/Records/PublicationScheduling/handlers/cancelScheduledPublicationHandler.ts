/**
 * @file cancelScheduledPublicationHandler.ts
 * @description Handler for canceling a scheduled publication for a DatoCMS record
 * Extracted from the DestroyScheduledPublicationOnRecord tool
 */

import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled publication for a DatoCMS record
 */
export const cancelScheduledPublicationHandler = createDeleteHandler({
  domain: "records",
  schemaName: "cancel_scheduled_publication",
  schema: recordsSchemas.cancel_scheduled_publication,
  entityName: "Scheduled Publication",
  idParam: "itemId",
  clientAction: async (client, args) => {
    await client.scheduledPublication.destroy(args.itemId);
  },
  successMessage: (itemId) => `Successfully canceled scheduled publication for record '${itemId}'`
});
