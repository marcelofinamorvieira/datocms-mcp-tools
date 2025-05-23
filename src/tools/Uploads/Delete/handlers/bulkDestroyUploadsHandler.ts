import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createResponse, createErrorResponse } from "../../../../utils/responseHandlers.js";

export const bulkDestroyUploadsHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "bulk_destroy",
  schema: uploadsSchemas.bulk_destroy,
  errorContext: {
    operation: "bulk_delete",
    resourceType: "Upload",
    handlerName: "bulkDestroyUploadsHandler"
  }
}, async (args, context) => {
  const { apiToken, uploadIds, environment } = args;
  
  if (!uploadIds.length) {
    return createErrorResponse("No upload IDs provided.");
  }
  if (uploadIds.length > 200) {
    return createErrorResponse("Max 200 uploads per bulk delete.");
  }

  const client = context.getClient(apiToken, environment);
  
  const uploadsParam: { type: "upload"; id: string }[] =
    uploadIds.map(id => ({ type: "upload", id }));
  await client.uploads.bulkDestroy({ uploads: uploadsParam });

  return createResponse(
    `Successfully deleted ${uploadIds.length} upload(s).`
  );
});