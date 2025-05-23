import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { modelFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler for listing all model filters
 */
export const listModelFiltersHandler = createListHandler({
  domain: "ui.modelFilter",
  schemaName: "list",
  schema: modelFilterSchemas.list,
  entityName: "Model Filter",
  listGetter: async (client) => {
    const typedClient = createTypedUIClient(client);

    // Fetch all model filters
    return await typedClient.listModelFilters();
  },
  countGetter: async (client) => {
    const typedClient = createTypedUIClient(client);
    
    // Get all model filters to count them (API doesn't provide count endpoint)
    const allFilters = await typedClient.listModelFilters();
    
    return allFilters.length;
  }
});