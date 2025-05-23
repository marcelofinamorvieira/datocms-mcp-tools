import { z } from "zod";
import { createCustomHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for rotating (regenerating) an API token in DatoCMS
 */
export const rotateTokenHandler = createCustomHandler({
  domain: "collaborators.apiTokens",
  operation: "rotate",
  schemaName: "rotate_token",
  schema: apiTokenSchemas.rotate_token,
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof apiTokenSchemas.rotate_token>) => {
    const rotatedToken = await client.rotateAPIToken(args.tokenId);
    return {
      data: rotatedToken,
      meta: {
        message: "API token successfully rotated"
      }
    };
  }
});