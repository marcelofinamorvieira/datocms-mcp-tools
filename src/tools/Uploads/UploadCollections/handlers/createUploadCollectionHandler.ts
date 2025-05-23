import { createCreateHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";

export const createUploadCollectionHandler = createCreateHandler({
  domain: "uploads",
  schemaName: "create_collection",
  schema: uploadsSchemas.create_collection,
  entityName: "Upload Collection",
  successMessage: (result: any) => `Successfully created upload collection '${result.label}' with ID ${result.id}`,
  clientAction: async (client, args) => {
    const { apiToken, environment, ...params } = args;
    return await client.uploadCollections.create(params);
  }
});