/**
 * @file fetchMaintenanceModeHandler.ts
 * @description Handler for fetching the current maintenance mode status
 */

import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for fetching the current maintenance mode status
 */
export const fetchMaintenanceModeHandler = createCustomHandler(
  {
    domain: "environments",
    schemaName: "maintenance_status",
    schema: environmentSchemas.maintenance_status,
    errorContext: { handlerName: "environments.maintenance.status" }
  },
  async (args) => {
    const { apiToken } = args;
    const client = UnifiedClientManager.getDefaultClient(apiToken);

    try {
      const maintenanceMode = await client.maintenanceMode.find();
      if (!maintenanceMode) {
        return createErrorResponse("Error: Failed to fetch maintenance mode status.");
      }
      return createResponse(JSON.stringify(maintenanceMode, null, 2));
    } catch (apiError: unknown) {
      if (isAuthorizationError(apiError)) {
        return createErrorResponse("Error: Please provide a valid DatoCMS API token. The token you provided was rejected by the DatoCMS API.");
      }
      throw apiError;
    }
  }
);
