/**
 * @file createUploadsFilterHandler.ts
 * @description Handler for creating a DatoCMS uploads filter
 */

import { createCreateHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { uploadsFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";
import { z } from "zod";

/**
 * Handler function for creating a DatoCMS uploads filter
 */
export const createUploadsFilterHandler = createCreateHandler({
  domain: "ui.uploadsFilter",
  schemaName: "create",
  schema: uploadsFilterSchemas.create,
  entityName: "Uploads Filter",
  successMessage: (result: any) => `Successfully created uploads filter '${result.name}' with ID ${result.id}`,
  clientAction: async (client, args: z.infer<typeof uploadsFilterSchemas.create>) => {
    const typedClient = createTypedUIClient(client);
    
    // Create uploads filter payload
    // The schema uses 'payload' but the API expects 'filter' with type and attributes
    const filterPayload: any = {
      name: args.name,
      filter: {
        type: 'filter',
        attributes: args.payload || {}
      },
      shared: true
    };

    // Create the uploads filter
    return await typedClient.createUploadsFilter(filterPayload);
  }
});