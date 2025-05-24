import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";

export const bulkDestroyUploadsHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "bulk_destroy",
  schema: uploadsSchemas.bulk_destroy,
  errorContext: {
    operation: "bulk_delete",
    resourceType: "Upload",
    handlerName: "bulkDestroyUploadsHandler"
  }
}, async (args) => {
  const { apiToken, uploadIds, environment } = args;
  
  if (!uploadIds.length) {
    throw new Error("No upload IDs provided.");
  }
  if (uploadIds.length > 200) {
    throw new Error("Max 200 uploads per bulk delete.");
  }

  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
  
  const uploadsParam: { type: "upload"; id: string }[] =
    uploadIds.map((id: string) => ({ type: "upload", id }));
  await client.uploads.bulkDestroy({ uploads: uploadsParam });

  return createResponse(
    `Successfully deleted ${uploadIds.length} upload(s).`
  );
});