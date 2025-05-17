/**
 * @file renameEnvironmentHandler.ts
 * @description Handler for renaming a DatoCMS environment
 */

import type { z } from "zod";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, isNotFoundError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";
import type { McpResponse } from "../../environmentTypes.js";
import { createEnvironmentClient } from "../../environmentClient.js";

/**
 * Handler for renaming a DatoCMS environment
 * 
 * @param args - The arguments for renaming an environment
 * @returns A response with the updated environment or an error message
 */
export const renameEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.rename>): Promise<McpResponse> => {
  const { apiToken, environmentId, newId } = args;
  
  try {
    // Initialize our type-safe environment client
    const environmentClient = createEnvironmentClient(apiToken);
    
    try {
      // Rename the environment using our type-safe client
      const environment = await environmentClient.renameEnvironment(environmentId, {
        id: newId
      });
      
      if (!environment) {
        const response = createStandardErrorResponse(
          `Failed to rename environment with ID '${environmentId}'.`,
          { error_code: "ENVIRONMENT_NOT_FOUND" }
        );
        return createStandardMcpResponse(response);
      }

      const response = createStandardSuccessResponse(environment as any);
      return createStandardMcpResponse(response);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        const response = createStandardErrorResponse("Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.", { error_code: "INVALID_API_TOKEN" });
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
      `Error renaming environment: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
