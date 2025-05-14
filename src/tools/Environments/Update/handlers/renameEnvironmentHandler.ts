/**
 * @file renameEnvironmentHandler.ts
 * @description Handler for renaming a DatoCMS environment
 */

import type { z } from "zod";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
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
        return createErrorResponse(`Error: Failed to rename environment with ID '${environmentId}'.`);
      }
      
      return createResponse(JSON.stringify(environment, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: Environment with ID '${environmentId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error: unknown) {
    return createErrorResponse(`Error renaming environment: ${extractDetailedErrorInfo(error)}`);
  }
};