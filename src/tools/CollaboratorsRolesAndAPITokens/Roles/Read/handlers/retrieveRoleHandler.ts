import { z } from "zod";
import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { roleSchemas } from "../../../schemas.js";

/**
 * Handler for retrieving a specific role by ID from DatoCMS
 */
export const retrieveRoleHandler = createRetrieveHandler<
  z.infer<typeof roleSchemas.retrieve_role>,
  any  // Role type from DatoCMS
>({
  domain: "collaborators.roles",
  schemaName: "retrieve_role",
  schema: roleSchemas.retrieve_role,
  entityName: "Role",
  idParam: "roleId",
  clientAction: async (client, args) => {
    return await client.roles.find(args.roleId);
  }
});