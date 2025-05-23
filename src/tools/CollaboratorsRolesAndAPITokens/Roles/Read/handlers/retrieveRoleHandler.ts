import { z } from "zod";
import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for retrieving a specific role by ID from DatoCMS
 */
export const retrieveRoleHandler = createRetrieveHandler({
  domain: "collaborators.roles",
  schemaName: "retrieve_role",
  schema: roleSchemas.retrieve_role,
  entityName: "Role",
  idParam: "roleId",
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof roleSchemas.retrieve_role>) => {
    return await client.findRole(args.roleId);
  }
});