import { z } from "zod";
import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for duplicating a role in DatoCMS
 */
export const duplicateRoleHandler = createCreateHandler<
  z.infer<typeof roleSchemas.duplicate_role>,
  SimpleSchemaTypes.Role
>({
  domain: "collaborators.roles",
  schemaName: "duplicate_role",
  schema: roleSchemas.duplicate_role,
  entityName: "Role",
  successMessage: (result) => `Role '${result.name}' duplicated successfully with ID: ${result.id}`,
  clientAction: async (client, args) => {
    return await client.roles.duplicate(args.roleId);
  }
});