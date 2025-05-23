/**
 * @file updateUserHandler.ts
 * @description Handler for updating a DatoCMS user
 */

import { z } from "zod";
import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";
import { UpdateCollaboratorParams } from "../../../collaboratorsTypes.js";

/**
 * Handler for updating a DatoCMS user
 */
export const updateUserHandler = createUpdateHandler({
  domain: "collaborators.users",
  schemaName: "user_update",
  schema: collaboratorSchemas.user_update,
  entityName: "User",
  idParam: "userId",
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof collaboratorSchemas.user_update>) => {
    const { userId, email, first_name, last_name, role_id } = args;
    
    // Create update payload, filtering out undefined fields
    const updatePayload: UpdateCollaboratorParams = {};
    if (email !== undefined) updatePayload.email = email;
    if (first_name !== undefined) updatePayload.first_name = first_name;
    if (last_name !== undefined) updatePayload.last_name = last_name;
    if (role_id !== undefined) updatePayload.role = { id: role_id, type: 'role' as const };
    
    // Update the user
    return await client.updateCollaborator(userId, updatePayload);
  }
});