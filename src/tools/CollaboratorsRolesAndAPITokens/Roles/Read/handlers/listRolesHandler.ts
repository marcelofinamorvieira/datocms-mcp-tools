import { z } from "zod";
import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for listing all roles in DatoCMS
 */
export const listRolesHandler = createListHandler<
  z.infer<typeof roleSchemas.list_roles>,
  any  // Role type from DatoCMS
>({
  domain: "collaborators.roles",
  schemaName: "list_roles",
  schema: roleSchemas.list_roles,
  entityName: "Role",
  clientAction: async (client, _args) => {
    // Use the correct API method from the standard Client
    return await client.roles.list();
  }
});