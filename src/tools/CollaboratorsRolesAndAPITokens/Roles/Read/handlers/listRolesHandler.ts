import { z } from "zod";
import { createListHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for listing all roles in DatoCMS
 */
export const listRolesHandler = createListHandler({
  domain: "collaborators.roles",
  schemaName: "list_roles",
  schema: roleSchemas.list_roles,
  entityName: "Role",
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof roleSchemas.list_roles>) => {
    return await client.listRoles();
  }
});