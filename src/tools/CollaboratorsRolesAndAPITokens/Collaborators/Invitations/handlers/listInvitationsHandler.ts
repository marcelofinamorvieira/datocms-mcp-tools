/**
 * @file listInvitationsHandler.ts
 * @description Handler for listing DatoCMS site invitations
 */

import { z } from "zod";
import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for listing DatoCMS site invitations
 */
export const listInvitationsHandler = createListHandler({
  domain: "collaborators.invitations",
  schemaName: "invitation_list",
  schema: collaboratorSchemas.invitation_list,
  entityName: "Invitation",
  clientType: "collaborators",
  listGetter: async (client) => {
    return await client.listInvitations();
  },
  countGetter: async (client) => {
    const invitations = await client.listInvitations();
    return invitations.length;
  }
});