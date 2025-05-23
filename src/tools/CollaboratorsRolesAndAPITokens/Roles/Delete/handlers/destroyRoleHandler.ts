import { z } from "zod";
import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
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
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof roleSchemas.destroy_role>) => {
    await client.destroyRole(args.roleId);
    return { success: true };
  }
});