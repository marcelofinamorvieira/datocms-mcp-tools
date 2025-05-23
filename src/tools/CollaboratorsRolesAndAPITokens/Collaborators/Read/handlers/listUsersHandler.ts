/**
 * @file listUsersHandler.ts
 * @description Handler for listing DatoCMS site users
 */

import { z } from "zod";
import { createListHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for listing DatoCMS site users
 */
export const listUsersHandler = createListHandler({
  domain: "collaborators.users",
  schemaName: "user_list",
  schema: collaboratorSchemas.user_list,
  entityName: "User",
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.user_list>) => {
    return await client.listCollaborators();
  }
});