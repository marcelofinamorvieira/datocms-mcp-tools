import { z } from "zod";
import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";

/**
 * Handler for deleting an API token in DatoCMS
 */
export const destroyTokenHandler = createDeleteHandler<
  z.infer<typeof apiTokenSchemas.destroy_token>
>({
  domain: "collaborators.apiTokens",
  schemaName: "destroy_token",
  schema: apiTokenSchemas.destroy_token,
  entityName: "API Token",
  idParam: "tokenId",
  successMessage: (tokenId: string) => `API Token with ID '${tokenId}' was successfully deleted.`,
  clientAction: async (client, args) => {
    await client.accessTokens.destroy(args.tokenId);
  }
});