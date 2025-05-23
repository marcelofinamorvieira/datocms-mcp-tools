import { createDeleteHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const deleteUploadCollectionHandler = createDeleteHandler({
  domain: "uploads",
  schemaName: "delete_collection",
  schema: uploadsSchemas.delete_collection,
  entityName: "Upload Collection",
  idParam: "uploadCollectionId",
  clientAction: async (client, args) => {
    return await client.uploadCollections.destroy(args.uploadCollectionId);
  }
});