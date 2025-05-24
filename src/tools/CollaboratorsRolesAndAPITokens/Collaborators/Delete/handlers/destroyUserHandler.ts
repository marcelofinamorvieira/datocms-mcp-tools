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
export const destroyUserHandler = createDeleteHandler<
  z.infer<typeof collaboratorSchemas.user_destroy>
>({
  domain: "collaborators.users",
  schemaName: "user_destroy",
  schema: collaboratorSchemas.user_destroy,
  entityName: "User",
  idParam: "userId",
  successMessage: (userId: string) => `User with ID '${userId}' was successfully deleted.`,
  clientAction: async (client, args) => {
    await client.users.destroy(args.userId);
  }
});