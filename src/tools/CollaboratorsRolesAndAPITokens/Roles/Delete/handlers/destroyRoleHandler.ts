import { z } from "zod";
import { createDeleteHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for deleting a role in DatoCMS
 */
export const destroyRoleHandler = createDeleteHandler({
  domain: "collaborators.roles",
  schemaName: "destroy_role",
  schema: roleSchemas.destroy_role,
  entityName: "Role",
  idParam: "roleId",
  clientType: ClientType.COLLABORATORS,
  successMessage: (roleId: any) => `Role with ID '${roleId}' was successfully deleted.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof roleSchemas.destroy_role>) => {
    await client.destroyRole(args.roleId);
  }
});