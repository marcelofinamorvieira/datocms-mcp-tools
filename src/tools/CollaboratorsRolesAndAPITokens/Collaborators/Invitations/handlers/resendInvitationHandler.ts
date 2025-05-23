/**
 * @file resendInvitationHandler.ts
 * @description Handler for resending a DatoCMS site invitation
 */

import { z } from "zod";
import { createUpdateHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for resending a DatoCMS site invitation
 */
export const resendInvitationHandler = createUpdateHandler({
  domain: "collaborators.invitations",
  schemaName: "invitation_resend",
  schema: collaboratorSchemas.invitation_resend,
  entityName: "Invitation",
  idParam: "invitationId",
  clientType: ClientType.COLLABORATORS,
  successMessage: (result: any) => `Invitation with ID ${result.id} successfully resent.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof collaboratorSchemas.invitation_resend>) => {
    await client.resendInvitation(args.invitationId);
    return { id: args.invitationId, success: true };
  }
});