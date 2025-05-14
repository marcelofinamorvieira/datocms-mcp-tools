import type { z } from "zod";
import { getClient } from "../../../../utils/clientManager.js";
import {
  isAuthorizationError,
  isNotFoundError,
  createErrorResponse
, extractDetailedErrorInfo } from "../../../../utils/errorHandlers.js";
import { createResponse } from "../../../../utils/responseHandlers.js";
import { uploadsSchemas } from "../../schemas.js";

export const getUploadCollectionHandler = async (
  args: z.infer<typeof uploadsSchemas.get_collection>
) => {
  const { apiToken, uploadCollectionId, environment } = args;
  try {
    const client = getClient(apiToken, environment);
    const collection = await client.uploadCollections.find(uploadCollectionId);
    return createResponse(JSON.stringify(collection, null, 2));
  } catch (e) {
    if (isAuthorizationError(e)) {
      return createErrorResponse("Invalid or unauthorized API token.");
    }
    if (isNotFoundError(e)) {
      return createErrorResponse(`Collection '${uploadCollectionId}' not found.`);
    }
    return createErrorResponse(
      `Error retrieving collection: ${e instanceof Error ? e.message : String(e)}`
    );
  }
};