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
export const listUsersHandler = createListHandler<
  z.infer<typeof collaboratorSchemas.user_list>,
  any  // User type from DatoCMS
>({
  domain: "collaborators.users",
  schemaName: "user_list",
  schema: collaboratorSchemas.user_list,
  entityName: "User",
  clientAction: async (client, _args) => {
    return await client.users.list();
  }
});