/**
 * @file activateMaintenanceModeHandler.ts
 * @description Handler for activating maintenance mode
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
 * Handler for activating maintenance mode
 */
export const activateMaintenanceModeHandler = async (args: z.infer<typeof environmentSchemas.maintenance_activate>) => {
  const { apiToken, force = false } = args;
  
  try {
    // Initialize DatoCMS client
    const client = getClient(apiToken);
    
    try {
      // Activate maintenance mode
      const options = { force };
      const maintenanceMode = await client.maintenanceMode.activate(options);

      if (!maintenanceMode) {
        const response = createStandardErrorResponse("Failed to activate maintenance mode.");
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
      `Error activating maintenance mode: ${extractDetailedErrorInfo(error)}`
    );
    return createStandardMcpResponse(response);
  }
};
