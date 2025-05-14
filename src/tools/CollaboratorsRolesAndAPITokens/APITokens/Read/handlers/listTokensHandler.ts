import { z } from "zod";
import { apiTokenSchemas } from "../../../schemas.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { createErrorResponse, extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import { ListAPITokensResponse, isCollaboratorsAuthError } from "../../../collaboratorsTypes.js";
import { createTypedCollaboratorsClientFromToken } from "../../../collaboratorsClientManager.js";

type Params = z.infer<typeof apiTokenSchemas.list_tokens>;

/**
 * Handler for listing all API tokens in DatoCMS
 */
export const listTokensHandler = async (params: Params): Promise<ListAPITokensResponse> => {
  const { apiToken, environment } = params;

  try {
    // Initialize TypedCollaboratorsClient
    const typedClient = createTypedCollaboratorsClientFromToken(apiToken, environment);

    try {
      // Fetch all API tokens using typed client
      // Using our typed client to get API tokens
      const tokens = await typedClient.listAPITokens();

      // Return success response
      return {
        success: true,
        data: tokens
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
      error: `Error listing DatoCMS API tokens: ${extractDetailedErrorInfo(error)}`
    };
  }
};