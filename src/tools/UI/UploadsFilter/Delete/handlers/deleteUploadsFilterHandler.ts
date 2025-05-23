/**
 * @file deleteUploadsFilterHandler.ts
 * @description Handler for deleting a DatoCMS uploads filter
 */

import { createDeleteHandler } from "../../../../../utils/enhancedHandlerFactory.js";
import { uploadsFilterSchemas } from "../../schemas.js";
import { createTypedUIClient } from "../../../uiClient.js";

/**
 * Handler function for deleting a DatoCMS uploads filter
 */
export const deleteUploadsFilterHandler = createDeleteHandler({
  domain: "ui.uploadsFilter",
  schemaName: "delete",
  schema: uploadsFilterSchemas.delete,
  entityName: "Uploads Filter",
  idParam: "uploadsFilterId",
  clientAction: async (client, args) => {
    const typedClient = createTypedUIClient(client);
    
    // Delete the uploads filter
    await typedClient.deleteUploadsFilter(args.uploadsFilterId);
  }
});