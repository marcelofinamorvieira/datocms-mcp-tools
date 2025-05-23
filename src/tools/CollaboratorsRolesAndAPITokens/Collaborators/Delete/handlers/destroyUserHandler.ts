/**
 * @file destroyUserHandler.ts
 * @description Handler for deleting a DatoCMS user
 */

import { z } from "zod";
import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for deleting a DatoCMS user
 */
export const destroyUserHandler = createDeleteHandler({
  domain: "collaborators.users",
  schemaName: "user_destroy",
  schema: collaboratorSchemas.user_destroy,
  entityName: "User",
  idParam: "userId",
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof collaboratorSchemas.user_destroy>) => {
    await client.destroyCollaborator(args.userId);
    return { success: true };
  }
});