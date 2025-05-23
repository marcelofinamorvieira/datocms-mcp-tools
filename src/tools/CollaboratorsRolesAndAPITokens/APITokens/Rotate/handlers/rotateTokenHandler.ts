import { z } from "zod";
import { createUpdateHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for rotating (regenerating) an API token in DatoCMS
 */
export const rotateTokenHandler = createUpdateHandler({
  domain: "collaborators.apiTokens",
  schemaName: "rotate_token",
  schema: apiTokenSchemas.rotate_token,
  entityName: "API Token",
  idParam: "tokenId",
  clientType: ClientType.COLLABORATORS,
  successMessage: (result: any) => `API Token '${result.attributes.name}' successfully rotated. New token value: ${result.attributes.token}`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof apiTokenSchemas.rotate_token>) => {
    return await client.rotateAPIToken(args.tokenId);
  }
});