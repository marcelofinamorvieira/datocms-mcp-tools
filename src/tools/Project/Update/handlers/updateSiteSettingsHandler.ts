/**
 * @file updateSiteSettingsHandler.ts
 * @description Handler for updating DatoCMS site settings
 * 
 * This handler uses the enhanced factory pattern which provides:
 * - Automatic debug tracking when DEBUG=true
 * - Performance monitoring
 * - Standardized error handling
 * - Schema validation
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { projectSchemas } from "../../schemas.js";
import { createProjectClient } from "../../projectClient.js";
import { isDatoCMSValidationError, SiteUpdateParams } from "../../projectTypes.js";

/**
 * Handler for updating DatoCMS site settings
 * 
 * Debug features:
 * - Tracks API call duration to DatoCMS
 * - Logs update payload size
 * - Provides execution trace for troubleshooting
 * - Sanitizes sensitive data (API tokens) in debug output
 */
export const updateSiteSettingsHandler = createCustomHandler({
  domain: 'project',
  schemaName: 'update_site_settings',
  schema: projectSchemas.update_site_settings,
  errorContext: {
    operation: 'update',
    resourceType: 'Site',
    handlerName: 'updateSiteSettingsHandler'
  }
}, async (args) => {
  const { apiToken, settings, environment } = args;
  
  try {
    // Initialize DatoCMS typed client
    const projectClient = createProjectClient(apiToken, environment);
    
    // Update the site settings using the typed client
    const updatedSite = await projectClient.updateSite(settings as SiteUpdateParams);
    
    // Return success response with the updated site data
    return createResponse(JSON.stringify({
      success: true,
      data: updatedSite,
      message: "Site settings updated successfully."
    }, null, 2));
    
  } catch (apiError: unknown) {
    // Check for validation errors
    if (isDatoCMSValidationError(apiError)) {
      const validationErrors = apiError.errors || [];
      
      // Return error response with validation details
      return createResponse(JSON.stringify({
        success: false,
        error: "Validation error occurred when updating site settings.",
        validationErrors: validationErrors
      }, null, 2));
    }
    
    // Re-throw other errors to be handled by the enhanced factory's error handling
    throw apiError;
  }
});
