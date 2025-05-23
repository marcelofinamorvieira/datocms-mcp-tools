/**
 * @file retrieveUserHandler.ts
 * @description Handler for retrieving a specific DatoCMS user
 */

import { z } from "zod";
import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
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
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof collaboratorSchemas.user_retrieve>) => {
    return await client.findCollaborator(args.userId);
  }
});