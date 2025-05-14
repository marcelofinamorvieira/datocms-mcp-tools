/**
 * @file listUsersHandler.ts
 * @description Handler for listing DatoCMS site users
 */

import type { z } from "zod";
import { getClient } from "../../../../../utils/clientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { collaboratorSchemas } from "../../../schemas.js";

type Params = z.infer<typeof collaboratorSchemas.user_list>;

/**
 * Handler for listing DatoCMS site users
 */
export const listUsersHandler = async (params: Params) => {
  const { apiToken, environment } = params;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken, environment);
    
    try {
      // Fetch all users using the users.list() method
      const users = await client.users.list();

      // Convert to JSON and create response
      return createResponse(JSON.stringify({
        success: true,
        data: users,
        message: "Users retrieved successfully"
      }, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return createErrorResponse(`Error listing DatoCMS site users: ${extractDetailedErrorInfo(error)}`);
  }
};