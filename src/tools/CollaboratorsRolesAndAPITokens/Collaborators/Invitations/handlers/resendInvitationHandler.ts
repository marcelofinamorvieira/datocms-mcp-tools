/**
 * @file resendInvitationHandler.ts
 * @description Handler for resending a DatoCMS site invitation
 */

import { z } from "zod";
import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for resending a DatoCMS site invitation
 */
export const resendInvitationHandler = createUpdateHandler<
  z.infer<typeof collaboratorSchemas.invitation_resend>,
  { id: string; success: boolean }
>({
  domain: "collaborators.invitations",
  schemaName: "invitation_resend",
  schema: collaboratorSchemas.invitation_resend,
  entityName: "Invitation",
  idParam: "invitationId",
  successMessage: (result) => `Invitation with ID ${result.id} successfully resent.`,
  clientAction: async (client, args) => {
    await client.siteInvitations.resend(args.invitationId);
    return { id: args.invitationId, success: true };
  }
});