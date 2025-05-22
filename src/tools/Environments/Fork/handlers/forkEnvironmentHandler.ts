/**
 * @file forkEnvironmentHandler.ts
 * @description Handler for forking a DatoCMS environment
 */

import { createCreateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for forking a DatoCMS environment
 */
export const forkEnvironmentHandler = createCreateHandler({
  domain: "environments",
  schemaName: "fork",
  schema: environmentSchemas.fork,
  successMessage: (env) => `Environment '${(env as any).id}' has been forked successfully`,
  clientAction: async (client, args) => {
    const { environmentId, newId, fast = false, force = false } = args;
    const forkOptions = {
      id: newId,
      immediate_return: false,
      fast,
      force
    };
    return await client.environments.fork(environmentId, forkOptions);
  }
});
