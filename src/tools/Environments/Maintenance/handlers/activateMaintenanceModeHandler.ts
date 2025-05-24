/**
 * @file activateMaintenanceModeHandler.ts
 * @description Handler for activating maintenance mode
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { environmentSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";

/**
 * Handler for activating maintenance mode
 */
export const activateMaintenanceModeHandler = createCustomHandler({
  domain: "environments",
  schemaName: "maintenance_activate",
  schema: environmentSchemas.maintenance_activate,
  errorContext: {
    operation: "activateMaintenanceMode",
    resourceType: "MaintenanceMode",
    handlerName: "activateMaintenanceModeHandler"
  }
}, async (args) => {
  const { apiToken, force = false } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken);
  
  // Activate maintenance mode
  const options = { force };
  const maintenanceMode = await client.maintenanceMode.activate(options);
  
  if (!maintenanceMode) {
    throw new Error("Failed to activate maintenance mode.");
  }
  
  return createResponse(JSON.stringify(maintenanceMode, null, 2));
});