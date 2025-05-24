import { z } from "zod";
import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { apiTokenSchemas } from "../../../schemas.js";
import { SimpleSchemaTypes } from "@datocms/cma-client-node";

/**
 * Handler for creating a new API token in DatoCMS
 */
export const createTokenHandler = createCreateHandler<
  z.infer<typeof apiTokenSchemas.create_token>,
  SimpleSchemaTypes.AccessToken
>({
  domain: "collaborators.apiTokens",
  schemaName: "create_token",
  schema: apiTokenSchemas.create_token,
  entityName: "API Token",
  successMessage: (result) => `API Token '${result.name}' created successfully with ID: ${result.id}`,
  clientAction: async (client, args) => {
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
        // Use the standard client API - roles have name directly on the object
        const roles = await client.roles.list();
        const matchingRole = roles.find((r) => r.name.toLowerCase() === role.toLowerCase());
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

    // Create the token using the standard client API
    // The API expects role to be RoleData: { type: "role", id: string }
    const createParams: SimpleSchemaTypes.AccessTokenCreateSchema = {
      name,
      role: { type: "role", id: roleId },
      can_access_cda: can_access_cda !== undefined ? can_access_cda : true,
      can_access_cda_preview: can_access_cda_preview !== undefined ? can_access_cda_preview : true,
      can_access_cma: can_access_cma !== undefined ? can_access_cma : true
    };

    // Use the standard client API
    return await client.accessTokens.create(createParams);
  }
});