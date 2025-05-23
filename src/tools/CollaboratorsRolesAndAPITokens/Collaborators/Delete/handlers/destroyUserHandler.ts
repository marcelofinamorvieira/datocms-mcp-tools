/**
 * @file destroyUserHandler.ts
 * @description Handler for deleting a DatoCMS user
 */

import { z } from "zod";
import { createDeleteHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
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
  clientType: ClientType.COLLABORATORS,
  successMessage: (userId: any) => `User with ID '${userId}' was successfully deleted.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.user_destroy>) => {
    await client.destroyCollaborator(args.userId);
  }
});