/**
 * @file deactivateMaintenanceModeHandler.ts
 * @description Handler for deactivating maintenance mode
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { environmentSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import { createResponse } from "../../../../utils/responseHandlers.js";

/**
 * Handler for deactivating maintenance mode
 */
export const deactivateMaintenanceModeHandler = createCustomHandler({
  domain: "environments",
  schemaName: "maintenance_deactivate",
  schema: environmentSchemas.maintenance_deactivate,
  errorContext: {
    operation: "deactivateMaintenanceMode",
    resourceType: "MaintenanceMode",
    handlerName: "deactivateMaintenanceModeHandler"
  }
}, async (args) => {
  const { apiToken } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken);
  
  // Deactivate maintenance mode
  const maintenanceMode = await client.maintenanceMode.deactivate();
  
  if (!maintenanceMode) {
    throw new Error("Failed to deactivate maintenance mode.");
  }
  
  return createResponse(JSON.stringify(maintenanceMode, null, 2));
});