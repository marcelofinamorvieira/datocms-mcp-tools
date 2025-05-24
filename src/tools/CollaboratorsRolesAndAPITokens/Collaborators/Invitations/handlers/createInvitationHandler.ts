/**
 * @file createInvitationHandler.ts
 * @description Handler for creating a new DatoCMS site invitation
 */

import { z } from "zod";
import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for creating a new DatoCMS site invitation
 */
export const createInvitationHandler = createCreateHandler<
  z.infer<typeof collaboratorSchemas.invitation_create>,
  SimpleSchemaTypes.SiteInvitation
>({
  domain: "collaborators.invitations",
  schemaName: "invitation_create",
  schema: collaboratorSchemas.invitation_create,
  entityName: "Invitation",
  successMessage: (result) => `Invitation created successfully for ${result.email}`,
  clientAction: async (client, args) => {
    const { email, role } = args;
    
    // Create the invitation - handle different role formats
    // If role is a predefined string, convert to proper resource linkage format
    const roleData = typeof role === 'string'
      ? { id: role, type: 'role' as const }
      : role;

    // Create the invitation
    return await client.siteInvitations.create({
      email,
      role: roleData
    });
  }
});