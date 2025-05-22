/**
 * @file standardizedListEnvironmentsHandler.ts
 * @description Standardized handler for listing DatoCMS environments
 * @module tools/Environments/Read
 */

import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { 
  createStandardPaginatedResponse, 
  createStandardErrorResponse,
  createStandardMcpResponse,
  PaginationInfo
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Standardized handler for listing DatoCMS environments
 * 
 * Fetches all environments for a DatoCMS project using the standardized
 * response format. Supports pagination and includes a consistent response structure.
 * 
 * @param args - The request arguments
 * @param args.apiToken - DatoCMS API token
 * @returns Environments list with pagination info or error response
 */
export const standardizedListEnvironmentsHandler = async (args: z.infer<typeof environmentSchemas.list>) => {
  const { apiToken } = args;
  
  try {
    // Initialize DatoCMS client
    const client = UnifiedClientManager.getDefaultClient(apiToken);
    
    try {
      // Fetch environments
      const environments = await client.environments.list();
      
      // Create pagination information
      const paginationInfo: PaginationInfo = {
        limit: environments.length,
        offset: 0,
        total: environments.length,
        has_more: false
      };
      
      // Create standardized response
      const response = createStandardPaginatedResponse(
        environments as any[], // Use type assertion to avoid complex type issues
        paginationInfo,
        `Found ${environments.length} environment(s).`
      );
      
      return createStandardMcpResponse(response);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        const response = createStandardErrorResponse(
          "Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.",
          { error_code: "INVALID_API_TOKEN" }
        );
        return createStandardMcpResponse(response);
      }
      
      // Create standard error response for other API errors
      const response = createStandardErrorResponse(apiError);
      return createStandardMcpResponse(response);
    }
  } catch (error: unknown) {
    // Create standard error response for unexpected errors
    const response = createStandardErrorResponse(
      `Error listing environments: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};