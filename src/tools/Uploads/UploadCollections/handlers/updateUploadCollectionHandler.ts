import { createUpdateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const updateUploadCollectionHandler = createUpdateHandler({
  domain: "uploads",
  schemaName: "update_collection",
  schema: uploadsSchemas.update_collection,
  entityName: "Upload Collection",
  idParam: "uploadCollectionId",
  clientAction: async (client, args) => {
    const { apiToken, uploadCollectionId, environment, ...data } = args;
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided for update.");
    }
    return await client.uploadCollections.update(uploadCollectionId, data);
  }
});