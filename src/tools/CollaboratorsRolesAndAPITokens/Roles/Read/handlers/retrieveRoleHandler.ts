import { z } from "zod";
import { createRetrieveHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
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
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof roleSchemas.retrieve_role>) => {
    return await client.findRole(args.roleId);
  }
});