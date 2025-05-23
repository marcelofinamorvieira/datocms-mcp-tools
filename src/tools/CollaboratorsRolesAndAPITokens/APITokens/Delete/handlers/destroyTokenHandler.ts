import { z } from "zod";
import { createDeleteHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for deleting an API token in DatoCMS
 */
export const destroyTokenHandler = createDeleteHandler({
  domain: "collaborators.apiTokens",
  schemaName: "destroy_token",
  schema: apiTokenSchemas.destroy_token,
  entityName: "API Token",
  idParam: "tokenId",
  clientType: ClientType.COLLABORATORS,
  successMessage: (tokenId: any) => `API Token with ID '${tokenId}' was successfully deleted.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof apiTokenSchemas.destroy_token>) => {
    await client.destroyAPIToken(args.tokenId);
  }
});