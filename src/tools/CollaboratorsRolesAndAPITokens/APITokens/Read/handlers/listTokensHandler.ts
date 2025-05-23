import { z } from "zod";
import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for listing all API tokens in DatoCMS
 */
export const listTokensHandler = createListHandler({
  domain: "collaborators.apiTokens",
  schemaName: "list_tokens",
  schema: apiTokenSchemas.list_tokens,
  entityName: "API Token",
  clientType: "collaborators",
  listGetter: async (client) => {
    return await client.listAPITokens();
  },
  countGetter: async (client) => {
    const tokens = await client.listAPITokens();
    return tokens.length;
  }
});