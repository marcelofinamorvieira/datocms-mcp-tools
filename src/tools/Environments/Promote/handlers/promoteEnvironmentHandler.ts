/**
 * @file promoteEnvironmentHandler.ts
 * @description Handler for promoting a DatoCMS environment to primary status
 */

import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for promoting a DatoCMS environment to primary status
 */
export const promoteEnvironmentHandler = createUpdateHandler({
  domain: "environments",
  schemaName: "promote",
  schema: environmentSchemas.promote,
  entityName: "Environment",
  idParam: "environmentId",
  clientAction: async (client, args) => {
    return await client.environments.promote(args.environmentId);
  },
  successMessage: () => "Environment was promoted to primary."
});
