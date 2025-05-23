/**
 * @file updateUploadsFilterHandler.ts
 * @description Handler for updating a DatoCMS uploads filter
 */

import { createUpdateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { uploadsFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler function for updating a DatoCMS uploads filter
 */
export const updateUploadsFilterHandler = createUpdateHandler({
  domain: "ui.uploadsFilter",
  schemaName: "update",
  schema: uploadsFilterSchemas.update,
  entityName: "Uploads Filter",
  idParam: "uploadsFilterId",
  clientAction: async (client, args: z.infer<typeof uploadsFilterSchemas.update>) => {
    const typedClient = createTypedUIClient(client);
    
    // Create uploads filter update payload (only including defined fields)
    const filterPayload: any = {};

    // Add fields only if they are defined
    if (args.name !== undefined) filterPayload.name = args.name;
    if (args.payload !== undefined) {
      // The schema uses 'payload' but the API expects 'filter' with type and attributes
      filterPayload.filter = {
        type: 'filter',
        attributes: args.payload
      };
    }
    
    // Note: The typed client will handle default values for shared if needed
    
    // Update the uploads filter
    return await typedClient.updateUploadsFilter(args.uploadsFilterId, filterPayload);
  }
});