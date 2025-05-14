/**
 * @file getProjectInfoHandler.ts
 * @description Handler for retrieving DatoCMS project information
 */

import type { z } from "zod";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { projectSchemas } from "../../schemas.js";
import { createProjectClient } from "../../projectClient.js";
import { isDatoCMSAuthorizationError, Site } from "../../projectTypes.js";

/**
 * Response type for the getProjectInfo handler
 */
export interface GetProjectInfoResponse {
  success: boolean;
  data?: Site;
  error?: string;
}

/**
 * Handler for retrieving DatoCMS project information
 * 
 * @param args - The arguments containing apiToken and optionally environment
 * @returns A response containing the project information or an error message
 */
export const getProjectInfoHandler = async (
  args: z.infer<typeof projectSchemas.get_info>
): Promise<GetProjectInfoResponse> => {
  const { apiToken, environment } = args;
  
  try {
    // Initialize DatoCMS typed client
    const projectClient = createProjectClient(apiToken, environment);
    
    try {
      // Retrieve the project information using the typed client
      const site = await projectClient.findSite();
      
      // Return the project data
      return {
        success: true,
        data: site
      };
      
    } catch (apiError: unknown) {
      if (isDatoCMSAuthorizationError(apiError) || isAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return {
      success: false,
      error: `Error retrieving DatoCMS site information: ${extractDetailedErrorInfo(error)}`
    };
  }
};
