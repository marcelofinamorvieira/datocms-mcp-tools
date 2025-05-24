import { z } from "zod";
import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for listing all API tokens in DatoCMS
 */
export const listTokensHandler = createListHandler<
  z.infer<typeof apiTokenSchemas.list_tokens>,
  any  // AccessToken type from DatoCMS
>({
  domain: "collaborators.apiTokens",
  schemaName: "list_tokens",
  schema: apiTokenSchemas.list_tokens,
  entityName: "API Token",
  clientAction: async (client, _args) => {
    return await client.accessTokens.list();
  }
});