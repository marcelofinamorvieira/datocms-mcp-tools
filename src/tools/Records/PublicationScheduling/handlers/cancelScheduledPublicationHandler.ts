/**
 * @file cancelScheduledPublicationHandler.ts
 * @description Handler for canceling a scheduled publication for a DatoCMS record
 * Extracted from the DestroyScheduledPublicationOnRecord tool
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { recordsSchemas } from "../../schemas.js";

/**
 * Handler function for canceling a scheduled publication for a DatoCMS record
 */
export const cancelScheduledPublicationHandler = createCustomHandler({
  domain: "records",
  schemaName: "cancel_scheduled_publication",
  schema: recordsSchemas.cancel_scheduled_publication,
  entityName: "Scheduled Publication",
  clientAction: async (client, args) => {
    const { itemId } = args;
    
    // Cancel the scheduled publication
    await client.scheduledPublication.destroy(itemId);
    
    // Return success response
    return `Successfully cancelled scheduled publication for item with ID '${itemId}'.`;
  }
});
