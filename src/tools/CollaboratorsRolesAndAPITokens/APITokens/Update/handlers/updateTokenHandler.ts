import { z } from "zod";
import { createUpdateHandler, ClientActionFn, DatoCMSClient } from "../../../../../utils/enhancedHandlerFactory.js";
import { ClientType } from "../../../../../utils/unifiedClientManager.js";
import { apiTokenSchemas } from "../../../schemas.js";
import { UpdateAPITokenParams, Role } from "../../../collaboratorsTypes.js";

/**
 * Handler for updating an API token in DatoCMS
 */
export const updateTokenHandler = createUpdateHandler({
  domain: "collaborators.apiTokens",
  schemaName: "update_token",
  schema: apiTokenSchemas.update_token,
  entityName: "API Token",
  idParam: "tokenId",
  clientType: ClientType.COLLABORATORS,
  successMessage: (result: any) => `API Token '${result.attributes.name}' updated successfully.`,
  clientAction: async (client: DatoCMSClient, args: z.infer<typeof apiTokenSchemas.update_token>) => {
    const {
      tokenId,
      name,
      role,
      can_access_cda,
      can_access_cda_preview,
      can_access_cma
    } = args;

    // Prepare the update payload with all required fields
    const updatePayload: UpdateAPITokenParams = {
      name: name,
      can_access_cda: can_access_cda,
      can_access_cda_preview: can_access_cda_preview,
      can_access_cma: can_access_cma,
      role: undefined
    };

    // Handle role assignment
    if (role === null) {
      updatePayload.role = undefined;
    } else if (typeof role === 'string') {
      // Handle predefined role names or role IDs
      if (['admin', 'editor', 'developer', 'seo', 'contributor'].includes(role)) {
        const roles = await client.listRoles();
        const matchingRole = roles.find((r: Role) => r.attributes.name.toLowerCase() === role.toLowerCase());
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
    return await client.updateAPIToken(tokenId, updatePayload);
  }
});