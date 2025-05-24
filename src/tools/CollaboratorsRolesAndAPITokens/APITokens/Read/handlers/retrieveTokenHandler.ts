import { z } from "zod";
import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for retrieving a specific API token in DatoCMS
 */
export const retrieveTokenHandler = createRetrieveHandler<
  z.infer<typeof apiTokenSchemas.retrieve_token>,
  any  // AccessToken type from DatoCMS
>({
  domain: "collaborators.apiTokens",
  schemaName: "retrieve_token",
  schema: apiTokenSchemas.retrieve_token,
  entityName: "API Token",
  idParam: "tokenId",
  clientAction: async (client, args) => {
    return await client.accessTokens.find(args.tokenId);
  }
});