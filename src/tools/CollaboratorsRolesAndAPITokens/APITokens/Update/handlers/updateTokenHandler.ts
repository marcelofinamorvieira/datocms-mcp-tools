import { z } from "zod";
import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for updating an API token in DatoCMS
 */
export const updateTokenHandler = createUpdateHandler<
  z.infer<typeof apiTokenSchemas.update_token>,
  SimpleSchemaTypes.AccessToken
>({
  domain: "collaborators.apiTokens",
  schemaName: "update_token",
  schema: apiTokenSchemas.update_token,
  entityName: "API Token",
  idParam: "tokenId",
  successMessage: (result) => `API Token '${result.name}' updated successfully.`,
  clientAction: async (client, args) => {
    const {
      tokenId,
      name,
      role,
      can_access_cda,
      can_access_cda_preview,
      can_access_cma
    } = args;

    // Prepare the update payload with all required fields
    const updatePayload: SimpleSchemaTypes.AccessTokenUpdateSchema = {
      name: name,
      can_access_cda: can_access_cda,
      can_access_cda_preview: can_access_cda_preview,
      can_access_cma: can_access_cma,
      role: null  // Default to null, will be updated if needed
    };

    // Handle role assignment
    if (role === null) {
      updatePayload.role = null;
    } else if (typeof role === 'string') {
      // Handle predefined role names or role IDs
      if (['admin', 'editor', 'developer', 'seo', 'contributor'].includes(role)) {
        const roles = await client.roles.list();
        const matchingRole = roles.find((r) => r.name.toLowerCase() === role.toLowerCase());
        if (matchingRole) {
          updatePayload.role = { id: matchingRole.id, type: "role" };
        } else {
          throw new Error(`Predefined role '${role}' not found in your DatoCMS project.`);
        }
      } else {
        // Assume it's a role ID
        updatePayload.role = { id: role, type: "role" };
      }
    } else if (typeof role === 'object' && role !== null) {
      // Direct role object assignment
      updatePayload.role = role;
    }

    // Update the API token with all required fields
    return await client.accessTokens.update(tokenId, updatePayload);
  }
});