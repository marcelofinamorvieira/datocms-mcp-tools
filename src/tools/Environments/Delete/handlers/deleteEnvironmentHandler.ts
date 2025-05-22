/**
 * @file deleteEnvironmentHandler.ts
 * @description Handler for deleting a DatoCMS environment
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Handler for deleting a DatoCMS environment
 */
export const deleteEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.delete>) => {
  const { apiToken, environmentId } = args;
  
  try {
    // Initialize DatoCMS client - don't pass environmentId when deleting the environment
    // This was causing issues because we're trying to initialize client with the environment we're deleting
    const client = UnifiedClientManager.getDefaultClient(apiToken);
    
    try {
      // Delete the environment
      const environment = await client.environments.destroy(environmentId);
      
      // The destroy method doesn't always return environment data, so we check for success differently
      return createResponse(JSON.stringify({ success: true, message: `Environment '${environmentId}' has been deleted successfully` }, null, 2));
      
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
    return createErrorResponse(`Error deleting environment: ${extractDetailedErrorInfo(error)}`);
  }
};