import { createRetrieveHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const getUploadCollectionHandler = createRetrieveHandler({
  domain: "uploads",
  schemaName: "get_collection",
  schema: uploadsSchemas.get_collection,
  entityName: "Upload Collection",
  idParam: "uploadCollectionId",
  clientAction: async (client, args) => {
    return await client.uploadCollections.find(args.uploadCollectionId);
  }
});