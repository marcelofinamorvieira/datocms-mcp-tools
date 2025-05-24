/**
 * @file inviteUserHandler.ts
 * @description Handler for inviting a new user to DatoCMS
 */

import { z } from "zod";
import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for inviting a new user to DatoCMS
 */
export const inviteUserHandler = createCreateHandler<
  z.infer<typeof collaboratorSchemas.user_invite>,
  SimpleSchemaTypes.SiteInvitation
>({
  domain: "collaborators.users",
  schemaName: "user_invite",
  schema: collaboratorSchemas.user_invite,
  entityName: "User Invitation",
  successMessage: (result) => `User invitation sent successfully to ${result.email}`,
  clientAction: async (client, args) => {
    const { email, role_id, first_name, last_name } = args;
    
    // Get the first role ID and convert to the format expected by the API
    // The DatoCMS API requires at least one role
    const primaryRole = role_id
      ? { id: role_id, type: 'role' as const }
      : null;
      
    if (!primaryRole) {
      throw new Error("At least one role ID must be provided");
    }
    
    // Create the site invitation
    return await client.siteInvitations.create({
      email,
      role: primaryRole,
      ...(first_name !== undefined && { first_name }),
      ...(last_name !== undefined && { last_name }),
    });
  }
});