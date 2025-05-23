/**
 * @file listUsersHandler.ts
 * @description Handler for listing DatoCMS site users
 */

import { z } from "zod";
import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for listing DatoCMS site users
 */
export const listUsersHandler = createListHandler({
  domain: "collaborators.users",
  schemaName: "user_list",
  schema: collaboratorSchemas.user_list,
  entityName: "User",
  clientType: "collaborators",
  listGetter: async (client) => {
    return await client.listCollaborators();
  },
  countGetter: async (client) => {
    const users = await client.listCollaborators();
    return users.length;
  }
});