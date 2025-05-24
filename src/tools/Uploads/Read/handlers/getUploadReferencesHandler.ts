import { createCustomHandler } from "../../../../utils/enhancedHandlerFactory.js";
import { uploadsSchemas } from "../../schemas.js";
import { createStandardSuccessResponse, createStandardMcpResponse } from "../../../../utils/standardResponse.js";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import type { Client, SimpleSchemaTypes } from "@datocms/cma-client-node";

export const getUploadReferencesHandler = createCustomHandler({
  domain: "uploads",
  schemaName: "references",
  schema: uploadsSchemas.references,
  errorContext: {
    operation: "retrieve",
    resourceType: "Upload References",
    handlerName: "getUploadReferencesHandler"
  }
}, async (args) => {
  const {
    apiToken,
    uploadId,
    nested,
    version,
    returnOnlyIds,
    environment
  } = args;

  const client = UnifiedClientManager.getDefaultClient(apiToken, environment) as Client;

  // Get references
  const references = await client.uploads.references(uploadId, {
    nested,
    version
  });

  // Return appropriate response based on result and requested format
  if (!references.length) {
    return createStandardMcpResponse(
      createStandardSuccessResponse(
        [],
        "No records reference this upload."
      )
    );
  }
  
  if (returnOnlyIds) {
    return createStandardMcpResponse(
      createStandardSuccessResponse(
        references.map((r: SimpleSchemaTypes.Item) => ({ id: r.id, type: r.type })),
        `Found ${references.length} references to this upload.`
      )
    );
  }
  
  return createStandardMcpResponse(
    createStandardSuccessResponse(
      references,
      `Found ${references.length} references to this upload.`
    )
  );
});