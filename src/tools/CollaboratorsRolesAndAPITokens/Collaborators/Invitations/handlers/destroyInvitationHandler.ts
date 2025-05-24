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
export const destroyInvitationHandler = createDeleteHandler<
  z.infer<typeof collaboratorSchemas.invitation_destroy>
>({
  domain: "collaborators.invitations",
  schemaName: "invitation_destroy",
  schema: collaboratorSchemas.invitation_destroy,
  entityName: "Invitation",
  idParam: "invitationId",
  successMessage: (invitationId) => `Invitation with ID '${invitationId}' was successfully deleted.`,
  clientAction: async (client, args) => {
    await client.siteInvitations.destroy(args.invitationId);
  }
});