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
export const retrieveUserHandler = createRetrieveHandler<
  z.infer<typeof collaboratorSchemas.user_retrieve>,
  any  // User type from DatoCMS
>({
  domain: "collaborators.users",
  schemaName: "user_retrieve",
  schema: collaboratorSchemas.user_retrieve,
  entityName: "User",
  idParam: "userId",
  clientAction: async (client, args) => {
    return await client.users.find(args.userId);
  }
});