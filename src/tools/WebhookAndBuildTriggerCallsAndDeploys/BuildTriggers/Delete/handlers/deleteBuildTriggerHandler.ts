import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { buildTriggerSchemas } from "../../../schemas.js";

/**
 * Deletes a build trigger from DatoCMS
 * 
 * @param params Parameters for deleting a build trigger
 * @returns Response indicating success or failure
 */
export const deleteBuildTriggerHandler = createDeleteHandler({
  domain: "webhooks.buildTriggers",
  schemaName: "delete",
  schema: buildTriggerSchemas.delete,
  entityName: "Build Trigger",
  idParam: "buildTriggerId",
  clientAction: async (client, args) => {
    await client.buildTriggers.destroy(args.buildTriggerId);
  }
});