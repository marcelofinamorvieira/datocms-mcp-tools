/**
 * @file listInvitationsHandler.ts
 * @description Handler for listing DatoCMS site invitations
 */

import { z } from "zod";
import { createListHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for listing DatoCMS site invitations
 */
export const listInvitationsHandler = createListHandler({
  domain: "collaborators.invitations",
  schemaName: "invitation_list",
  schema: collaboratorSchemas.invitation_list,
  entityName: "Invitation",
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.invitation_list>) => {
    return await client.listInvitations();
  }
});