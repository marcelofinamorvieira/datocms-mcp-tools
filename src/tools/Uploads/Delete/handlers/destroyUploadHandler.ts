import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const destroyUploadHandler = createDeleteHandler({
  domain: "uploads",
  schemaName: "destroy",
  schema: uploadsSchemas.destroy,
  entityName: "Upload",
  idParam: "uploadId",
  clientAction: async (client, args) => {
    await client.uploads.destroy(args.uploadId);
  }
});