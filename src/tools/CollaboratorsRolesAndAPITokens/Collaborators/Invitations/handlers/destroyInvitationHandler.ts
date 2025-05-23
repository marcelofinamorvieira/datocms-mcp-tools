/**
 * @file destroyInvitationHandler.ts
 * @description Handler for deleting a DatoCMS site invitation
 */

import { z } from "zod";
import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
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
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof collaboratorSchemas.invitation_destroy>) => {
    await client.destroyInvitation(args.invitationId);
    return { success: true };
  }
});