/**
 * @file retrieveUserHandler.ts
 * @description Handler for retrieving a specific DatoCMS user
 */

import { z } from "zod";
import { createRetrieveHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for retrieving a specific DatoCMS user
 */
export const retrieveUserHandler = createRetrieveHandler({
  domain: "collaborators.users",
  schemaName: "user_retrieve",
  schema: collaboratorSchemas.user_retrieve,
  entityName: "User",
  idParam: "userId",
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.user_retrieve>) => {
    return await client.findCollaborator(args.userId);
  }
});