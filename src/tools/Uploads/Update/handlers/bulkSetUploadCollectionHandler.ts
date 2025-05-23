import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createResponse } from "../../../../utils/responseHandlers.js";

export const bulkSetUploadCollectionHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "bulk_set_collection",
  schema: uploadsSchemas.bulk_set_collection,
  errorContext: {
    operation: "bulk_update",
    resourceType: "Upload Collection Assignment",
    handlerName: "bulkSetUploadCollectionHandler"
  }
}, async (args, context) => {
  const { apiToken, uploadIds, collectionId, environment } = args;

  const client = context.getClient(apiToken, environment);

  await client.uploads.bulkSetUploadCollection({
    uploads: uploadIds.map(id => ({ type: "upload", id })),
    upload_collection: collectionId
      ? { type: "upload_collection", id: collectionId }
      : null
  });

  const action = collectionId
    ? `assigned to collection '${collectionId}'`
    : "removed from their collection";
  return createResponse(`Successfully ${action} ${uploadIds.length} uploads.`);
});