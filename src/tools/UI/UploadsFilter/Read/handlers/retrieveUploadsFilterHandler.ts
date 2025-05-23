/**
 * @file retrieveUploadsFilterHandler.ts
 * @description Handler for retrieving a single DatoCMS uploads filter
 */

import { createRetrieveHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { uploadsFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for retrieving a single DatoCMS uploads filter
 */
export const retrieveUploadsFilterHandler = createRetrieveHandler({
  domain: "ui.uploadsFilter",
  schemaName: "retrieve",
  schema: uploadsFilterSchemas.retrieve,
  entityName: "Uploads Filter",
  idParam: "uploadsFilterId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Get the uploads filter
    return await typedClient.findUploadsFilter(args.uploadsFilterId);
  }
});
