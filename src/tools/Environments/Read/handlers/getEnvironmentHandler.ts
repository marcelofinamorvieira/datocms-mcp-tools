/**
 * @file getEnvironmentHandler.ts
 * @description Handler for retrieving DatoCMS environment information
 * @module tools/Environments/Read
 */

import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for retrieving a specific DatoCMS environment by ID
 * 
 * @param args - The request arguments
 * @param args.apiToken - DatoCMS API token
 * @param args.environmentId - ID of the environment to retrieve
 * @returns Environment data or error response
 */
export const getEnvironmentHandler = createRetrieveHandler({
  domain: "environments",
  schemaName: "retrieve",
  schema: environmentSchemas.retrieve,
  entityName: "Environment",
  idParam: "environmentId",
  clientAction: async (client, args) => {
    return await client.environments.find(args.environmentId as string);
  }
});
