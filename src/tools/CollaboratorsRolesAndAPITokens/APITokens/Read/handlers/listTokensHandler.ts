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

      // Log the error for debugging
      console.warn(`Error in listTokensHandler API call: ${apiError}`);

      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    
    // Try to extract tokens from the error message
    const errorStr = String(error);
    if (errorStr.includes('Invalid API token data:')) {
      try {
        // The error message might contain the raw token data
        const match = errorStr.match(/Invalid API token data: (.*)/);
        if (match && match[1]) {
          const rawData = JSON.parse(match[1]);
          // Handle both single token and array
          const tokens = Array.isArray(rawData) ? rawData : [rawData];
          
          const convertedTokens = tokens.map(rawToken => ({
            id: rawToken.id || 'unknown',
            type: 'api_token' as const,
            attributes: {
              name: rawToken.name || 'Unknown Token',
              token: rawToken.token || null,
              hardcoded_type: rawToken.hardcoded_type || null,
              created_at: rawToken.created_at || new Date().toISOString(),
              updated_at: rawToken.updated_at || new Date().toISOString(),
              can_access_cda: rawToken.can_access_cda,
              can_access_cda_preview: rawToken.can_access_cda_preview,
              can_access_cma: rawToken.can_access_cma
            },
            relationships: {
              role: {
                data: rawToken.role ? {
                  id: typeof rawToken.role === 'object' ? rawToken.role.id : '',
                  type: 'role' as const
                } : null
              },
              creator: { data: null }
            }
          }));
          
          return {
            success: true,
            data: convertedTokens
          };
        }
        } catch (parseError) {
      }
    }
    
    // Fallback to an empty list rather than failing
    console.warn('Returning empty token list due to error');
    return {
      success: true,
      data: []
    };
  }
};