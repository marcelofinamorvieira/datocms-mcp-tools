import { z } from "zod";
import { createListHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for listing all API tokens in DatoCMS
 */
export const listTokensHandler = createListHandler({
  domain: "collaborators.apiTokens",
  schemaName: "list_tokens",
  schema: apiTokenSchemas.list_tokens,
  entityName: "API Token",
  clientType: ClientType.COLLABORATORS,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof apiTokenSchemas.list_tokens>) => {
    return await client.listAPITokens();
  }
});