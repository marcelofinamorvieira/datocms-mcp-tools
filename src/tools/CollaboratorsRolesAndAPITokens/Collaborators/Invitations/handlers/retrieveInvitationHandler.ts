/**
 * @file retrieveInvitationHandler.ts
 * @description Handler for retrieving a specific DatoCMS site invitation
 */

import { z } from "zod";
import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for retrieving a specific DatoCMS site invitation
 */
export const retrieveInvitationHandler = createRetrieveHandler<
  z.infer<typeof collaboratorSchemas.invitation_retrieve>,
  any  // SiteInvitation type from DatoCMS
>({
  domain: "collaborators.invitations",
  schemaName: "invitation_retrieve",
  schema: collaboratorSchemas.invitation_retrieve,
  entityName: "Invitation",
  idParam: "invitationId",
  clientAction: async (client, args) => {
    return await client.siteInvitations.find(args.invitationId);
  }
});