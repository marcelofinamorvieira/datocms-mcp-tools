/**
 * @file deleteEnvironmentHandler.ts
 * @description Handler for deleting a DatoCMS environment
 */

import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for deleting a DatoCMS environment
 */
export const deleteEnvironmentHandler = createDeleteHandler({
  domain: "environments",
  schemaName: "delete",
  schema: environmentSchemas.delete,
  entityName: "Environment",
  idParam: "environmentId",
  clientAction: async (client, args) => {
    await client.environments.destroy(args.environmentId);
  },
  successMessage: (id) => `Environment '${id}' has been deleted successfully`
});
