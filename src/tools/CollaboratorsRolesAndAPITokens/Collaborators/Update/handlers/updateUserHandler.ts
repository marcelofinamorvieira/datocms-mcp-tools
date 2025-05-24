/**
 * @file updateUserHandler.ts
 * @description Handler for updating a DatoCMS user
 */

import { z } from "zod";
import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for updating a DatoCMS user
 */
export const updateUserHandler = createUpdateHandler<
  z.infer<typeof collaboratorSchemas.user_update>,
  SimpleSchemaTypes.User
>({
  domain: "collaborators.users",
  schemaName: "user_update",
  schema: collaboratorSchemas.user_update,
  entityName: "User",
  idParam: "userId",
  successMessage: (result) => `User '${result.email}' updated successfully.`,
  clientAction: async (client, args) => {
    const { userId, role_id } = args;
    // Note: email, first_name, and last_name cannot be updated via the API
    
    // Create update payload according to DatoCMS API
    // Note: The API only allows updating is_active and role, not name or email
    const updatePayload: SimpleSchemaTypes.UserUpdateSchema = {};
    
    // The API doesn't support updating first_name, last_name, or email
    // Only role can be updated from the provided parameters
    if (role_id !== undefined) {
      updatePayload.role = { id: role_id, type: 'role' };
    }
    
    // Update the user
    return await client.users.update(userId, updatePayload);
  }
});