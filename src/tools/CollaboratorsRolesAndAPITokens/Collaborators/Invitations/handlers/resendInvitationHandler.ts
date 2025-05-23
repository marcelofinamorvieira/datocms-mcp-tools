/**
 * @file resendInvitationHandler.ts
 * @description Handler for resending a DatoCMS site invitation
 */

import { z } from "zod";
import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for resending a DatoCMS site invitation
 */
export const resendInvitationHandler = createCustomHandler({
  domain: "collaborators.invitations",
  operation: "resend",
  schemaName: "invitation_resend",
  schema: collaboratorSchemas.invitation_resend,
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof collaboratorSchemas.invitation_resend>) => {
    await client.resendInvitation(args.invitationId);
    return {
      data: { success: true },
      meta: {
        message: `Invitation with ID ${args.invitationId} successfully resent.`
      }
    };
  }
});