import { z } from "zod";
import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for retrieving a specific API token in DatoCMS
 */
export const retrieveTokenHandler = createRetrieveHandler({
  domain: "collaborators.apiTokens",
  schemaName: "retrieve_token",
  schema: apiTokenSchemas.retrieve_token,
  entityName: "API Token",
  idParam: "tokenId",
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof apiTokenSchemas.retrieve_token>) => {
    return await client.findAPIToken(args.tokenId);
  }
});