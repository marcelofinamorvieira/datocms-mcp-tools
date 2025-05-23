import { z } from "zod";
import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";
import { CreateAPITokenParams, Role } from "../../../collaboratorsTypes.js";

/**
 * Handler for creating a new API token in DatoCMS
 */
export const createTokenHandler = createCreateHandler({
  domain: "collaborators.apiTokens",
  schemaName: "create_token",
  schema: apiTokenSchemas.create_token,
  entityName: "API Token",
  clientType: "collaborators",
  clientAction: async (client, args: z.infer<typeof apiTokenSchemas.create_token>) => {
    const {
      name,
      role,
      can_access_cda,
      can_access_cda_preview,
      can_access_cma
    } = args;

    // Prepare token creation parameters
    let roleId: string;

    // Handle role assignment
    if (typeof role === 'string') {
      // Handle predefined role names or role IDs
      if (['admin', 'editor', 'developer', 'seo', 'contributor'].includes(role)) {
        // We need to get the client directly as our typed client doesn't have this helper function
        const roles = await client.listRoles();
        const matchingRole = roles.find((r: Role) => r.attributes.name.toLowerCase() === role.toLowerCase());
        if (matchingRole) {
          roleId = matchingRole.id;
        } else {
          throw new Error(`Predefined role '${role}' not found in your DatoCMS project.`);
        }
      } else {
        // Assume it's a role ID
        roleId = role;
      }
    } else if (typeof role === 'object' && role !== null && 'id' in role) {
      // Direct role object assignment
      roleId = role.id.toString();
    } else {
      throw new Error("Invalid role specification. Please provide a valid role ID or predefined role name.");
    }

    // Create the token with our properly typed client
    const createParams: CreateAPITokenParams = {
      name,
      role: { id: roleId, type: 'role' },
      can_access_cda: can_access_cda === undefined ? true : can_access_cda,
      can_access_cda_preview: can_access_cda_preview === undefined ? true : can_access_cda_preview,
      can_access_cma: can_access_cma === undefined ? true : can_access_cma
    };

    // Our typed client abstracts away the details and handles the API correctly
    return await client.createAPIToken(createParams);
  }
});