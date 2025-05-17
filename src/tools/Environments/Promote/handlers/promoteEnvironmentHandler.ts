/**
 * @file promoteEnvironmentHandler.ts
 * @description Handler for promoting a DatoCMS environment to primary status
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, isNotFoundError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Handler for promoting a DatoCMS environment to primary status
 */
export const promoteEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.promote>) => {
  const { apiToken, environmentId } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken);
    
    try {
      // Promote the environment to primary
      const environment = await client.environments.promote(environmentId);

      if (!environment) {
        const response = createStandardErrorResponse(
          `Failed to promote environment with ID '${environmentId}' to primary.`,
          { error_code: "ENVIRONMENT_NOT_FOUND" }
        );
        return createStandardMcpResponse(response);
      }

      const response = createStandardSuccessResponse(environment as any);
      return createStandardMcpResponse(response);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        const response = createStandardErrorResponse(
          "Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.",
          { error_code: "INVALID_API_TOKEN" }
        );
        return createStandardMcpResponse(response);
      }

      if (isNotFoundError(apiError)) {
        const response = createStandardErrorResponse(
          `Environment with ID '${environmentId}' was not found.`,
          { error_code: "ENVIRONMENT_NOT_FOUND" }
        );
        return createStandardMcpResponse(response);
      }

      // Re-throw other API errors to be caught by the outer catch
      const response = createStandardErrorResponse(apiError);
      return createStandardMcpResponse(response);
    }
  } catch (error: unknown) {
    const response = createStandardErrorResponse(
      `Error promoting environment: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
