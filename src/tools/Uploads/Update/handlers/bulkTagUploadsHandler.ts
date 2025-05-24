import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";

export const bulkTagUploadsHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "bulk_tag",
  schema: uploadsSchemas.bulk_tag,
  errorContext: {
    operation: "bulk_update",
    resourceType: "Upload",
    handlerName: "bulkTagUploadsHandler"
  }
}, async (args) => {
  const { apiToken, uploadIds, tags, environment } = args;

  const client = UnifiedClientManager.getDefaultClient(apiToken, environment);

  const uploadsParam: { type: "upload"; id: string }[] =
    uploadIds.map((id: string) => ({ type: "upload", id }));
  await client.uploads.bulkTag({ uploads: uploadsParam, tags });

  return createResponse(
    `Successfully tagged ${uploadIds.length} upload(s) with [${tags.join(", ")}].`
  );
});