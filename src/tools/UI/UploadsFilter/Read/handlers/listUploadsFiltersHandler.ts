/**
 * @file listUploadsFiltersHandler.ts
 * @description Handler for listing DatoCMS uploads filters
 */

import { createListHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { uploadsFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for listing DatoCMS uploads filters
 */
export const listUploadsFiltersHandler = createListHandler({
  domain: "ui.uploadsFilter",
  schemaName: "list",
  schema: uploadsFilterSchemas.list,
  entityName: "Uploads Filter",
  listGetter: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the list of uploads filters
    const uploadsFilters = await typedClient.listUploadsFilters(args.page);
    
    return uploadsFilters;
  },
  countGetter: async (client) => {
    const typedClient = createTypedUIClient(client);
    
    // Get all uploads filters to count them (API doesn't provide count endpoint)
    const allFilters = await typedClient.listUploadsFilters();
    
    return allFilters.length;
  }
});
