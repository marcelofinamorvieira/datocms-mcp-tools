import type { z } from "zod";
import { UnifiedClientManager } from "../../../../utils/unifiedClientManager.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const deleteUploadCollectionHandler = async (
  args: z.infer<typeof uploadsSchemas.delete_collection>
) => {
  const { apiToken, uploadCollectionId, environment } = args;
  try {
    const client = UnifiedClientManager.getDefaultClient(apiToken, environment);
    const deleted = await client.uploadCollections.destroy(uploadCollectionId);
    return createResponse(JSON.stringify(deleted, null, 2));
  } catch (e) {
    if (isAuthorizationError(e)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    if (isNotFoundError(e)) {
      return createErrorResponse(`Collection '${uploadCollectionId}' not found.`);
    }
    return createErrorResponse(
      `Error deleting collection: ${e instanceof Error ? e.message : String(e)}`
    );
  }
};