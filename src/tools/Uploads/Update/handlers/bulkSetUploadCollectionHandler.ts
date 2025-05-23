import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";

export const bulkSetUploadCollectionHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "bulk_set_collection",
  schema: uploadsSchemas.bulk_set_collection,
  errorContext: {
    operation: "bulk_update",
    resourceType: "Upload Collection Assignment",
    handlerName: "bulkSetUploadCollectionHandler"
  }
}, async (args) => {
  const { apiToken, uploadIds, collectionId, environment } = args;

  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

  await client.uploads.bulkSetUploadCollection({
    uploads: uploadIds.map((id: string) => ({ type: "upload", id })),
    upload_collection: collectionId
      ? { type: "upload_collection", id: collectionId }
      : null
  });

  const action = collectionId
    ? `assigned to collection '${collectionId}'`
    : "removed from their collection";
  return createResponse(`Successfully ${action} ${uploadIds.length} uploads.`);
});