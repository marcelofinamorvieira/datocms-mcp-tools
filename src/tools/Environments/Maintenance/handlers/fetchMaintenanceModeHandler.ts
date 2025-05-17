/**
 * @file fetchMaintenanceModeHandler.ts
 * @description Handler for fetching the current maintenance mode status
 */

import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  createStandardSuccessResponse,
  createStandardErrorResponse,
  createStandardMcpResponse
} from "../../../../utils/standardResponse.js";
import { isAuthorizationError, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import type { environmentSchemas } from "../../schemas.js";

/**
 * Handler for fetching the current maintenance mode status
 */
export const fetchMaintenanceModeHandler = async (args: z.infer<typeof environmentSchemas.maintenance_status>) => {
  const { apiToken } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken);
    
    try {
      // Fetch maintenance mode status
      const maintenanceMode = await client.maintenanceMode.find();

      if (!maintenanceMode) {
        const response = createStandardErrorResponse("Failed to fetch maintenance mode status.");
        return createStandardMcpResponse(response);
      }

      const response = createStandardSuccessResponse(maintenanceMode as any);
      return createStandardMcpResponse(response);
      
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        const response = createStandardErrorResponse(
          "Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.",
          { error_code: "INVALID_API_TOKEN" }
        );
        return createStandardMcpResponse(response);
      }

      // Re-throw other API errors to be caught by the outer catch
      const response = createStandardErrorResponse(apiError);
      return createStandardMcpResponse(response);
    }
  } catch (error: unknown) {
    const response = createStandardErrorResponse(
      `Error fetching maintenance mode status: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
