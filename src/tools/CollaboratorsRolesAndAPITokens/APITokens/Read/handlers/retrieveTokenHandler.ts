import { z } from "zod";
import { apiTokenSchemas } from "../../../schemas.js";
import { isCollaboratorsAuthError, GetAPITokenResponse } from "../../../collaboratorsTypes.js";
import { extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { createTypedCollaboratorsClientFromToken } from "../../../collaboratorsClientManager.js";

type Params = z.infer<typeof apiTokenSchemas.retrieve_token>;

/**
 * Handler for retrieving a specific API token in DatoCMS
 */
export const retrieveTokenHandler = async (params: Params): Promise<GetAPITokenResponse> => {
  const { apiToken, tokenId, environment } = params;

  try {
    // Initialize TypedCollaboratorsClient
    const typedClient = createTypedCollaboratorsClientFromToken(apiToken, environment);

    try {
      // Fetch the specific API token using typed client
      const token = await typedClient.findAPIToken(tokenId);

      // Return success response
      return {
        success: true,
        data: token
      };
    } catch (apiError: unknown) {
      if (isCollaboratorsAuthError(apiError)) {
        return {
          success: false,
          error: "Error: Invalid or unauthorized DatoCMS API token."
        };
      }

      // Handle not found error
      if ((apiError as any).type === 'collaborators_not_found_error') {
        return {
          success: false,
          error: `Error: API token with ID '${tokenId}' not found.`
        };
      }

      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return {
      success: false,
      error: `Error retrieving DatoCMS API token: ${extractDetailedErrorInfo(error)}`
    };
  }
};