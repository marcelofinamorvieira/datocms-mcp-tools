/**
 * @file listEnvironmentsHandler.ts
 * @description Handler for listing all DatoCMS environments
 */

import { createListHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for listing all DatoCMS environments
 */
export const listEnvironmentsHandler = createListHandler({
  domain: "environments",
  schemaName: "list",
  schema: environmentSchemas.list,
  entityName: "Environment",
  clientAction: async (client, _args) => {
    const environments = await client.environments.list();
    return environments;
  }
});
