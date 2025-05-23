import { z } from "zod";
import { createCreateHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for duplicating a role in DatoCMS
 */
export const duplicateRoleHandler = createCreateHandler({
  domain: "collaborators.roles",
  schemaName: "duplicate_role",
  schema: roleSchemas.duplicate_role,
  entityName: "Role",
  clientType: ClientType.COLLABORATORS,
  successMessage: (result: any) => `Role '${result.attributes.name}' duplicated successfully with ID: ${result.id}`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof roleSchemas.duplicate_role>) => {
    return await client.duplicateRole(args.roleId);
  }
});