/**
 * @file fetchMaintenanceModeHandler.ts
 * @description Handler for fetching the current maintenance mode status
 */

import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { environmentSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";

/**
 * Handler for fetching the current maintenance mode status
 */
export const fetchMaintenanceModeHandler = createCustomHandler({
  domain: "environments",
  schemaName: "maintenance_status",
  schema: environmentSchemas.maintenance_status,
  errorContext: {
    operation: "fetchMaintenanceMode",
    resourceType: "MaintenanceMode",
    handlerName: "fetchMaintenanceModeHandler"
  }
}, async (args) => {
  const { apiToken } = args;
  
  // Initialize DatoCMS client
  const client = UnifiedClientManager.getDefaultClient(apiToken);
  
  // Fetch maintenance mode status
  const maintenanceMode = await client.maintenanceMode.find();
  
  if (!maintenanceMode) {
    throw new Error("Failed to fetch maintenance mode status.");
  }
  
  return createResponse(JSON.stringify(maintenanceMode, null, 2));
});