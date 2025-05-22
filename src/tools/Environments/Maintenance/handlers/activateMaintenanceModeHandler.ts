/**
 * @file activateMaintenanceModeHandler.ts
 * @description Handler for activating maintenance mode
 */

import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { isAuthorizationError, createErrorResponse , extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";

/**
 * Handler for activating maintenance mode
 */
export const activateMaintenanceModeHandler = createCustomHandler(
  {
    domain: "environments",
    schemaName: "maintenance_activate",
    schema: environmentSchemas.maintenance_activate,
    errorContext: { handlerName: "environments.maintenance.activate" }
  },
  async (args) => {
    const { apiToken, force = false } = args;
    const client = UnifiedClientManager.getDefaultClient(apiToken);

    try {
      const maintenanceMode = await client.maintenanceMode.activate({ force });
      if (!maintenanceMode) {
        return createErrorResponse("Error: Failed to activate maintenance mode.");
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
