/**
 * @file deactivateMaintenanceModeHandler.ts
 * @description Handler for deactivating maintenance mode
 */

import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for deactivating maintenance mode
 */
export const deactivateMaintenanceModeHandler = createCustomHandler(
  {
    domain: "environments",
    schemaName: "maintenance_deactivate",
    schema: environmentSchemas.maintenance_deactivate,
    errorContext: { handlerName: "environments.maintenance.deactivate" }
  },
  async (args) => {
    const { apiToken } = args;
    const client = UnifiedClientManager.getDefaultClient(apiToken);

    try {
      const maintenanceMode = await client.maintenanceMode.deactivate();
      if (!maintenanceMode) {
        return createErrorResponse("Error: Failed to deactivate maintenance mode.");
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
