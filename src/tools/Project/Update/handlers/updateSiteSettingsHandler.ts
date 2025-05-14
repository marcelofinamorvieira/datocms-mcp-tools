/**
 * @file updateSiteSettingsHandler.ts
 * @description Handler for updating DatoCMS site settings
 */

import type { z } from "zod";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { projectSchemas } from "../../schemas.js";
import { createProjectClient } from "../../projectClient.js";
import { isDatoCMSAuthorizationError, isDatoCMSValidationError, Site, SiteUpdateParams } from "../../projectTypes.js";

/**
 * Response type for the updateSiteSettings handler
 */
export interface UpdateSiteSettingsResponse {
  success: boolean;
  data?: Site;
  message?: string;
  error?: string;
  validationErrors?: Array<{
    field?: string;
    message: string;
  }>;
}

/**
 * Handler for updating DatoCMS site settings
 * 
 * @param args - The arguments containing apiToken, settings, and optionally environment
 * @returns A response containing the updated site or an error message
 */
export const updateSiteSettingsHandler = async (
  args: z.infer<typeof projectSchemas.update_site_settings>
): Promise<UpdateSiteSettingsResponse> => {
  const { apiToken, settings, environment } = args;
  
  try {
    // Initialize DatoCMS typed client
    const projectClient = createProjectClient(apiToken, environment);
    
    try {
      // Update the site settings using the typed client
      const updatedSite = await projectClient.updateSite(settings as SiteUpdateParams);
      
      // Return the updated site data with success message
      return {
        success: true,
        data: updatedSite,
        message: "Site settings updated successfully."
      };
      
    } catch (apiError: unknown) {
      if (isDatoCMSAuthorizationError(apiError) || isAuthorizationError(apiError)) {
        return {
          success: false,
          error: "Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API."
        };
      }
      
      // Check for validation errors
      if (isDatoCMSValidationError(apiError)) {
        return {
          success: false,
          error: "Validation error occurred when updating site settings.",
          validationErrors: apiError.errors
        };
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return {
      success: false,
      error: `Error updating DatoCMS site settings: ${extractDetailedErrorInfo(error)}`
    };
  }
};
