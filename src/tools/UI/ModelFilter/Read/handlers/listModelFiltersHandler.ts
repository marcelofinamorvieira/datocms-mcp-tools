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
  clientAction: async (client, _args) => {
    const typedClient = createTypedUIClient(client);

    // Fetch all model filters
    return await typedClient.listModelFilters();
  }
});