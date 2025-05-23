import { z } from "zod";
import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for duplicating a role in DatoCMS
 */
export const duplicateRoleHandler = createCustomHandler({
  domain: "collaborators.roles",
  operation: "duplicate",
  schemaName: "duplicate_role",
  schema: roleSchemas.duplicate_role,
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof roleSchemas.duplicate_role>) => {
    const duplicatedRole = await client.duplicateRole(args.roleId);
    return {
      data: duplicatedRole,
      meta: {
        message: "Role duplicated successfully"
      }
    };
  }
});