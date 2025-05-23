import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createResponse } from "../../../../utils/responseHandlers.js";

export const bulkTagUploadsHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "bulk_tag",
  schema: uploadsSchemas.bulk_tag,
  errorContext: {
    operation: "bulk_update",
    resourceType: "Upload",
    handlerName: "bulkTagUploadsHandler"
  }
}, async (args, context) => {
  const { apiToken, uploadIds, tags, environment } = args;

  const client = context.getClient(apiToken, environment);

  const uploadsParam: { type: "upload"; id: string }[] =
    uploadIds.map(id => ({ type: "upload", id }));
  await client.uploads.bulkTag({ uploads: uploadsParam, tags });

  return createResponse(
    `Successfully tagged ${uploadIds.length} upload(s) with [${tags.join(", ")}].`
  );
});