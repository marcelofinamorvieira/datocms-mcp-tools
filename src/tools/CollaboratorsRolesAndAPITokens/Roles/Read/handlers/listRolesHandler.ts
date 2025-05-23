import { z } from "zod";
import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for listing all roles in DatoCMS
 */
export const listRolesHandler = createListHandler({
  domain: "collaborators.roles",
  schemaName: "list_roles",
  schema: roleSchemas.list_roles,
  entityName: "Role",
  clientType: "collaborators",
  listGetter: async (client) => {
    return await client.listRoles();
  },
  countGetter: async (client) => {
    const roles = await client.listRoles();
    return roles.length;
  }
});