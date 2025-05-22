/**
 * @file renameEnvironmentHandler.ts
 * @description Handler for renaming a DatoCMS environment
 */

import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for renaming a DatoCMS environment
 * 
 * @param args - The arguments for renaming an environment
 * @returns A response with the updated environment or an error message
 */
export const renameEnvironmentHandler = createUpdateHandler({
  domain: "environments",
  schemaName: "rename",
  schema: environmentSchemas.rename,
  entityName: "Environment",
  idParam: "environmentId",
  clientAction: async (client, args) => {
    const { environmentId, newId } = args;
    return await client.environments.rename(environmentId, { id: newId });
  },
  successMessage: (env) => `Environment '${(env as any).id}' was successfully renamed.`
});
