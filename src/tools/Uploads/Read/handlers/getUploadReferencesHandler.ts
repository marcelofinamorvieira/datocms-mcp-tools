import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createStandardResponse } from "../../../../utils/standardResponse.js";

export const getUploadReferencesHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "references",
  schema: uploadsSchemas.references,
  errorContext: {
    operation: "retrieve",
    resourceType: "Upload References",
    handlerName: "getUploadReferencesHandler"
  }
}, async (args, context) => {
  const {
    apiToken,
    uploadId,
    nested,
    version,
    returnOnlyIds,
    environment
  } = args;

  const client = context.getClient(apiToken, environment);

  // Get references
  const references = await client.uploads.references(uploadId, {
    nested,
    version
  });

  // Return appropriate response based on result and requested format
  if (!references.length) {
    return createStandardResponse({
      success: true,
      data: [],
      message: "No records reference this upload."
    });
  }
  
  if (returnOnlyIds) {
    return createStandardResponse({
      success: true,
      data: references.map(r => ({ id: r.id, type: r.type })),
      message: `Found ${references.length} references to this upload.`
    });
  }
  
  return createStandardResponse({
    success: true,
    data: references,
    message: `Found ${references.length} references to this upload.`
  });
});