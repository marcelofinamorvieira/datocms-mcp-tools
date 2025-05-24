import { z } from "zod";
import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for deleting a role in DatoCMS
 */
export const destroyRoleHandler = createDeleteHandler<
  z.infer<typeof roleSchemas.destroy_role>
>({
  domain: "collaborators.roles",
  schemaName: "destroy_role",
  schema: roleSchemas.destroy_role,
  entityName: "Role",
  idParam: "roleId",
  successMessage: (roleId: string) => `Role with ID '${roleId}' was successfully deleted.`,
  clientAction: async (client, args) => {
    await client.roles.destroy(args.roleId);
  }
});