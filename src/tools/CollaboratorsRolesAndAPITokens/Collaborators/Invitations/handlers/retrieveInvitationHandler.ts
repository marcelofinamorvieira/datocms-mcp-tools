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
export const retrieveInvitationHandler = createRetrieveHandler({
  domain: "collaborators.invitations",
  schemaName: "invitation_retrieve",
  schema: collaboratorSchemas.invitation_retrieve,
  entityName: "Invitation",
  idParam: "invitationId",
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof collaboratorSchemas.invitation_retrieve>) => {
    return await client.findInvitation(args.invitationId);
  }
});