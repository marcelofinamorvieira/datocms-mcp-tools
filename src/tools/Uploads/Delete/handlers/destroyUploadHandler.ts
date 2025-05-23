import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createResponse } from "../../../../utils/responseHandlers.js";

export const destroyUploadHandler = createDeleteHandler({
  domain: "uploads",
  schemaName: "destroy",
  schema: uploadsSchemas.destroy,
  entityName: "Upload",
  idParam: "uploadId",
  clientAction: async (client, args) => {
    const deleted = await client.uploads.destroy(args.uploadId);
    if (args.returnOnlyConfirmation) {
      return createResponse(`Successfully deleted upload '${args.uploadId}'.`);
    }
    return deleted;
  }
});