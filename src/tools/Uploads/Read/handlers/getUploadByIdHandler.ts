import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const getUploadByIdHandler = createRetrieveHandler({
  domain: "uploads",
  schemaName: "get",
  schema: uploadsSchemas.get,
  entityName: "Upload",
  idParam: "uploadId",
  clientAction: async (client, args) => {
    return await client.uploads.find(args.uploadId);
  }
});