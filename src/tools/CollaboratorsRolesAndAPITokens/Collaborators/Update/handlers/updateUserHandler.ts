/**
 * @file updateUserHandler.ts
 * @description Handler for updating a DatoCMS user
 */

import { z } from "zod";
import { createUpdateHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
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
  clientType: ClientType.COLLABORATORS,
  successMessage: (result: any) => `User '${result.attributes.email}' updated successfully.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.user_update>) => {
    const { userId, email, first_name, last_name, role_id } = args;
    
    // Create update payload, filtering out undefined fields
    const updatePayload: UpdateCollaboratorParams = {};
    // Note: email cannot be updated according to the API
    if (first_name !== undefined) updatePayload.first_name = first_name;
    if (last_name !== undefined) updatePayload.last_name = last_name;
    if (role_id !== undefined) updatePayload.role = { id: role_id, type: 'role' as const };
    
    // Update the user
    return await client.updateCollaborator(userId, updatePayload);
  }
});