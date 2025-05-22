/**
 * @file listInvitationsHandler.ts
 * @description Handler for listing DatoCMS site invitations
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../../utils/errorHandlers.js";
import type { collaboratorSchemas } from "../../../schemas.js";

/**
 * Handler for listing DatoCMS site invitations
 */
export const listInvitationsHandler = async (args: z.infer<typeof collaboratorSchemas.invitation_list>) => {
  const { apiToken, environment } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    
    try {
      // Fetch all invitations
      const invitations = await client.siteInvitations.list();
      
      // Convert to JSON and create response
      return createResponse(JSON.stringify(invitations, null, 2));
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      
      // Re-throw other API errors to be caught by the outer catch
      throw apiError;
    }
  } catch (error) {
    return createErrorResponse(`Error listing DatoCMS site invitations: ${extractDetailedErrorInfo(error)}`);
  }
};