import { z } from "zod";
import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
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
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof apiTokenSchemas.destroy_token>) => {
    await client.destroyAPIToken(args.tokenId);
    return { success: true };
  }
});