/**
 * @file createUploadsFilterHandler.ts
 * @description Handler for creating a DatoCMS uploads filter
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { uploadsFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { UploadsFilterCreateParams } from "../../../uiTypes.js";

/**
 * Handler function for creating a DatoCMS uploads filter
 */
export const createUploadsFilterHandler = createCreateHandler({
  domain: "ui.uploadsFilter",
  schemaName: "create",
  schema: uploadsFilterSchemas.create,
  entityName: "Uploads Filter",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Create uploads filter payload
    const filterPayload: UploadsFilterCreateParams = {
      name: args.name,
      filter: args.payload,
      shared: true
    };

    // Create the uploads filter
    return await typedClient.createUploadsFilter(filterPayload);
  }
});