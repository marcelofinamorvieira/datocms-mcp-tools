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
export const listInvitationsHandler = createListHandler<
  z.infer<typeof collaboratorSchemas.invitation_list>,
  any  // SiteInvitation type from DatoCMS
>({
  domain: "collaborators.invitations",
  schemaName: "invitation_list",
  schema: collaboratorSchemas.invitation_list,
  entityName: "Invitation",
  clientAction: async (client, _args) => {
    return await client.siteInvitations.list();
  }
});