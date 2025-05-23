/**
 * @file retrieveInvitationHandler.ts
 * @description Handler for retrieving a specific DatoCMS site invitation
 */

import { z } from "zod";
import { createRetrieveHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
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
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.invitation_retrieve>) => {
    return await client.findInvitation(args.invitationId);
  }
});