import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const updateUploadHandler = createUpdateHandler({
  domain: "uploads",
  schemaName: "update",
  schema: uploadsSchemas.update,
  entityName: "Upload",
  idParam: "uploadId",
  clientAction: async (client, args) => {
    const { uploadId, apiToken, environment, ...updateData } = args;
    return await client.uploads.update(uploadId, updateData as any);
  }
});