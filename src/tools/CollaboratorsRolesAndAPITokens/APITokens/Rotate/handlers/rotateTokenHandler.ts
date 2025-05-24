import { z } from "zod";
import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for rotating (regenerating) an API token in DatoCMS
 */
export const rotateTokenHandler = createUpdateHandler<
  z.infer<typeof apiTokenSchemas.rotate_token>,
  any  // AccessToken type from DatoCMS
>({
  domain: "collaborators.apiTokens",
  schemaName: "rotate_token",
  schema: apiTokenSchemas.rotate_token,
  entityName: "API Token",
  idParam: "tokenId",
  successMessage: (result) => {
    const name = result.attributes.name;
    const token = result.attributes.token || '<token hidden>';
    return `API Token '${name}' successfully rotated. New token value: ${token}`;
  },
  clientAction: async (client, args) => {
    return await client.accessTokens.regenerateToken(args.tokenId);
  }
});