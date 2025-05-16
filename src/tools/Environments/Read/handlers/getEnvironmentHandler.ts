/**
 * @file getEnvironmentHandler.ts
 * @description Handler for retrieving DatoCMS environment information
 * @module tools/Environments/Read
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, isNotFoundError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Handler for retrieving a specific DatoCMS environment by ID
 * 
 * @param args - The request arguments
 * @param args.apiToken - DatoCMS API token
 * @param args.environmentId - ID of the environment to retrieve
 * @returns Environment data or error response
 */
export const getEnvironmentHandler = async (args: z.infer<typeof environmentSchemas.retrieve>) => {
  const { apiToken, environmentId } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken);
    
    try {
      // Fetch environment information
      const environment = await client.environments.find(environmentId as string);
      
      if (!environment) {
        return createErrorResponse(`Error: Failed to fetch environment with ID '${environmentId}'.`);
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
    return createErrorResponse(`Error retrieving environment: ${extractDetailedErrorInfo(error)}`);
  }
};