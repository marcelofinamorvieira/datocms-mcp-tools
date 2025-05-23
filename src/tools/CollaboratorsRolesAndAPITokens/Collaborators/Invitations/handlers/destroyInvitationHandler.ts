/**
 * @file destroyInvitationHandler.ts
 * @description Handler for deleting a DatoCMS site invitation
 */

import { z } from "zod";
import { createDeleteHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for deleting a DatoCMS site invitation
 */
export const destroyInvitationHandler = createDeleteHandler({
  domain: "collaborators.invitations",
  schemaName: "invitation_destroy",
  schema: collaboratorSchemas.invitation_destroy,
  entityName: "Invitation",
  idParam: "invitationId",
  clientType: ClientType.COLLABORATORS,
  successMessage: (invitationId: any) => `Invitation with ID '${invitationId}' was successfully deleted.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.invitation_destroy>) => {
    await client.destroyInvitation(args.invitationId);
  }
});