/**
 * @file destroyUserHandler.ts
 * @description Handler for deleting a DatoCMS user
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { collaboratorSchemas } from "../../../schemas.js";

type Params = z.infer<typeof collaboratorSchemas.user_destroy>;

/**
 * Handler for deleting a DatoCMS user
 */
export const destroyUserHandler = async (params: Params) => {
  const { apiToken, userId, environment } = params;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Delete the user
      await client.users.destroy(userId);
      
      // Create success response
      return createResponse(JSON.stringify({
        success: true,
        message: "User deleted successfully"
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      if (isNotFoundError(apiError)) {
        return createErrorResponse(`Error: The user with ID '${userId}' was not found.`);
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return createErrorResponse(`Error deleting DatoCMS user: ${extractDetailedErrorInfo(error)}`);
  }
};