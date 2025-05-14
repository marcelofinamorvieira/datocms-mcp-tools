import { z } from "zod";
import { apiTokenSchemas } from "../../../schemas.js";
import { extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { CreateAPITokenParams, CreateAPITokenResponse, isCollaboratorsAuthError, Role } from "../../../collaboratorsTypes.js";
import { createTypedCollaboratorsClientFromToken } from "../../../collaboratorsClientManager.js";

type Params = z.infer<typeof apiTokenSchemas.create_token>;

/**
 * Handler for creating a new API token in DatoCMS
 */
export const createTokenHandler = async (params: Params): Promise<CreateAPITokenResponse> => {
  const {
    apiToken,
    name,
    role,
    can_access_cda,
    can_access_cda_preview,
    can_access_cma,
    environment
  } = params;

  try {
    // Initialize TypedCollaboratorsClient
    const typedClient = createTypedCollaboratorsClientFromToken(apiToken, environment);

    try {
      // Prepare token creation parameters
      let roleId: string;

      // Handle role assignment
      if (typeof role === 'string') {
        // Handle predefined role names or role IDs
        if (['admin', 'editor', 'developer', 'seo', 'contributor'].includes(role)) {
          // We need to get the client directly as our typed client doesn't have this helper function
          const roles = await typedClient.listRoles();
          const matchingRole = roles.find((r: Role) => r.attributes.name.toLowerCase() === role.toLowerCase());
          if (matchingRole) {
            roleId = matchingRole.id;
          } else {
            return {
              success: false,
              error: `Predefined role '${role}' not found in your DatoCMS project.`
            };
          }
        } else {
          // Assume it's a role ID
          roleId = role;
        }
      } else if (typeof role === 'object' && role !== null && 'id' in role) {
        // Direct role object assignment
        roleId = role.id.toString();
      } else {
        return {
          success: false,
          error: "Invalid role specification. Please provide a valid role ID or predefined role name."
        };
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
      const newToken = await typedClient.createAPIToken(createParams);

      // Return success response
      return {
        success: true,
        data: newToken
      };
    } catch (apiError: unknown) {
      if (isCollaboratorsAuthError(apiError)) {
        return {
          success: false,
          error: "Error: Invalid or unauthorized DatoCMS API token."
        };
      }

      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return {
      success: false,
      error: `Error creating DatoCMS API token: ${extractDetailedErrorInfo(error)}`
    };
  }
};